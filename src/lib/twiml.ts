/**
 * ===== TwiML Generator =======================================================
 *
 * Each method in this class is responsible for ingesting an options-generating
 * function or an options object, validating those options, and using them to
 * add TwiML markup to the instance's TwiML document.
 *
 * Once the document is rendered (by invoking the 'render' method), no
 * additional TwiML may be added.
 *
 * Generally speaking, a single instance of TwiMLDocument represents a single
 * request/response interaction between Twilio and Twilight; each new request
 * will have a new TwiMLDocument instance.
 *
 * Call Executors will iterate through user-provided call scripts until they
 * either reach the end of the script or reach a directive (re: this class'
 * TwiML-rendering methods) that is 'terminal'. When this happens, the Call
 * Executor will render the current TwiMLDocument and return it to Twilio,
 * remembering its place in the call script so that TwiML generation may resume
 * using a new TwiMLDocument once Twilio makes its next request.
 *
 * There is typically a 1:1 relationship betwwen a directive and a TwiML verb,
 * but some directives may render multiple verbs to facilitate Twilight's
 * programming model.
 */
import chalk from 'chalk';
import {head, map, omit, prop} from 'ramda';
// @ts-ignore
import {twiml} from 'twilio';

import {
  AbstractDirectiveOptions,
  DirectiveOptions,
  LooseObject
} from 'etc/types';

import {validate} from 'lib/ajv';

import {
  COUNTRIES,
  DEFAULT_TIMEOUT,
  LANGUAGES,
  TWILIO_HTTP_METHODS
} from 'etc/constants';

import {
  CALL_SCRIPT_ARRAY_SCHEMA
} from 'etc/schemas';

import locals from 'lib/locals';
import log from 'lib/log';
import TwilioClient from 'lib/twilio-client';
import {isValidPhoneNumber, removeUndefinedKeys} from 'lib/utils';


/**
 * Describes the shape of objects returned by TwiML-rendering methods.
 */
export interface TwiMLReturnValue {
  terminal: boolean;
  resume?: Function;
}


/**
 * Options object that is passed to our constructor.
 */
export interface TwiMLDocumentOptions {
  executor: any;
}


/**
 * Allows for the asynchronous, iterative creation of TwiML documents by call
 * executors.
 */
export default class TwiMLDocument {
  // Makes the type checker happy.
  [index: string]: any;


  /**
   * Reference to the application's Twilio client. This is used to get incoming
   * phone numbers associated with the Twilio application.
   */
  private readonly _client: TwilioClient;


  /**
   * TwiML voice response created when the instance is constructed.
   */
  private readonly _twiml: twiml.VoiceResponse;


  /**
   * Reference to the CallExecutor that created this instance.
   */
  private readonly _executor: any;


  /**
   * Set to true once the TwiML document has been rendered, after which, any
   * subsequent calls to TwiML-generating methods will throw an error.
   */
  private _rendered: boolean = false;


  constructor({executor}: TwiMLDocumentOptions) {
    this._client = locals.get('twilioClient');
    this._twiml = new twiml.VoiceResponse();
    this._executor = executor;
  }


  // ----- General -------------------------------------------------------------

  /**
   * Throws an error if a consumer tries to render the TwiML document more than
   * once, or tries to modify it by calling additional TwiML-rendering methods
   * after it has been rendered.
   */
  private _renderCheck(): void {
    if (this._rendered) {
      throw new Error('[TwiMLDocument::render] TwiML document cannot be modified after being rendered.');
    }
  }


  /**
   * Provided a directive options object or a function that should return one,
   * and an optional set of default options, returns a merged options object.
   *
   * The function may be async.
   */
  private async _parseOptions(optsOrOptsFn: AbstractDirectiveOptions, defaults?: LooseObject): Promise<DirectiveOptions> {
    if (typeof optsOrOptsFn === 'function') {
      return this._parseOptions(await optsOrOptsFn('__passed_from_twiml_parse_options'), defaults); // tslint:disable-line await-promise
    }

    return {...removeUndefinedKeys(defaults || {}), ...removeUndefinedKeys(optsOrOptsFn)};
  }


  /**
   * Used by <Dial> and <Sms> to determine an appropriate source ("callerId",
   * "From") attribute to use.
   */
  private async _computeSourceNumber(fromNumber: string): Promise<string> {
    if (isValidPhoneNumber(fromNumber)) {
      return fromNumber;
    }

    // Get the first phone number associated with the configured application SID.
    const appNumber = head(await this._client.getIncomingPhoneNumbers());

    if (appNumber && isValidPhoneNumber(appNumber)) {
      log.warn('TwiMLDocument::computeCallerId', [
        'Directive was not invoked with a valid source phone number, using the',
        `first number linked to the provided application SID (${appNumber}).`
      ].join(' '));

      return appNumber;
    }

    // If no valid "From" number could be determined, Twilio will not allow
    // us to forward the call.
    throw new Error([
      '[TwiMLDocument::computeCallerId] No suitable caller ID could be found;',
      'unable to forward call.'
    ].join(' '));
  }


  /**
   * Returns an XML representation of the TwiML instance. Once rendered, no
   * additional TwiML may be added to the document.
   */
  render(): string {
    this._renderCheck();
    this._rendered = true;
    return this._twiml.toString();
  }


  // ----- <Say> ---------------------------------------------------------------

  private static readonly SAY_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::say',
      label: 'options'
    },
    type: 'object',
    properties: {
      value: {type: 'string'},
      language: {type: 'string'},
      voice: {type: 'string'},
      loop: {type: 'number', minimum: 0}
    },
    required: ['value'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to Sspeak the provided text.
   *
   * This TwiML verb is 100% implemented.
   *
   * See: https://www.twilio.com/docs/api/twiml/say?code-language=js
   */
  async say(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const opts = await this._parseOptions(optsOrOptsFn, {
      voice: 'woman',
      language: 'en-GB'
    });

    validate(TwiMLDocument.SAY_SCHEMA, opts);

    this._twiml.say(omit(['value'], opts), opts.value);

    log.info('TwiMLDocument::say', `"${opts.value}"`);
    log.verbose('TwiMLDocument::say', chalk.gray(`- Language: "${opts.language}"`));
    log.verbose('TwiMLDocument::say', chalk.gray(`- Voice: "${opts.voice}"`));

    if (opts.loop) {
      log.verbose('TwiMLDocument::say', chalk.gray(`- Loop: ${opts.loop}`));
    }

    return {terminal: false};
  }


  // ----- <Play> --------------------------------------------------------------

  private static readonly PLAY_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::play',
      label: 'options'
    },
    type: 'object',
    properties: {
      value: {type: 'string'},
      loop: {type: 'number', minimum: 0},
      digits: {type: 'string'}
    },
    // This effectively allows either a "value" or "digits", but not both.
    oneOf: [
      {required: ['value']},
      {required: ['digits']}
    ],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio play the provided audio file.
   *
   * This TwiML verb is partially implemented. To send DTMF tones, use
   * #sendDigits instead.
   *
   * See: https://www.twilio.com/docs/api/twiml/play?code-language=js
   */
  async play(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const opts = await this._parseOptions(optsOrOptsFn);

    validate(TwiMLDocument.PLAY_SCHEMA, opts);

    this._twiml.play(omit(['value'], opts), opts.value);

    if (opts.value) {
      log.info('TwiMLDocument::play', `Playing: "${opts.value}".`);
    }

    if (opts.digits) {
      log.info('TwiMLDocument::play', `Sending DTMF sequence: "${opts.digits}".`);
    }

    if (opts.loop) {
      log.verbose('TwiMLDocument::play', chalk.gray(`- Loop: ${opts.loop}`));
    }

    return {terminal: false};
  }


  /**
   * Generates TwiML instructing Twilio to play DTMF tones corresponding to the
   * provided sequence of digits.
   *
   * This is a non-standard TwiML "verb". See #play().
   */
  async sendDigits(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    const opts = await this._parseOptions(optsOrOptsFn);
    return this.play({digits: opts.value});
  }


  // ----- <Gather> ------------------------------------------------------------

  private static readonly GATHER_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::gatherDigits',
      label: 'options'
    },
    type: 'object',
    properties: {
      numDigits: {type: 'number', minimum: 0},
      action: {type: 'string'},
      method: {type: 'string', enum: TWILIO_HTTP_METHODS},
      finishOnKey: {type: 'string'},
      hints: {type: 'string'},
      input: {type: 'string', enum: ['dtmf', 'speech', 'dtmf speech']},
      language: {type: 'string', enum: map(prop('tag'), LANGUAGES)},
      profanityFilter: {type: 'boolean'},
      speechTimeout: {type: 'number'},
      timeout: {type: 'number'},

      // Optional nested call script.
      children: CALL_SCRIPT_ARRAY_SCHEMA
    },
    required: ['action', 'method', 'numDigits'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to wait for the user to enter a sequence
   * of digits.
   *
   * Note: If an "action" attribute is provided to this directive, call flow
   * will not proceed using the current call script.
   *
   * TODO: Add support for nested VERBS (Play, Say, Pause).
   *
   * See: https://www.twilio.com/docs/api/twiml/gather?code-language=js
   */
  async gatherDigits(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const {voiceUrl, voiceMethod} = locals.get('config');

    const opts = await this._parseOptions(optsOrOptsFn, {
      action: voiceUrl,
      method: voiceMethod,
      timeout: DEFAULT_TIMEOUT
    });

    validate(TwiMLDocument.GATHER_SCHEMA, opts);

    const gather = this._twiml.gather(omit(['children'], opts));

    if (opts.children) {
      const nestedTwiml = await this._executor.parseCallScriptImmediately(opts.children);
      gather._getXml().raw(nestedTwiml);
    }

    // If "timeout" or "speechTimeout" is reached, this will cause Twilio to
    // make a request to the same URL it would have otherwise requested with the
    // caller's input. This way, call scripts can have a unified flow regardless
    // of whether a timeout was reached, and can simply check for the presence
    // of a "Digits" param in the request.
    this._twiml.redirect({method: voiceMethod}, voiceUrl);

    log.info('TwiMLDocument::gatherDigits', 'Waiting for user input...');
    log.verbose('TwiMLDocument::gatherDigits', chalk.gray(`- Maximum digits: ${opts.numDigits}`));
    log.verbose('TwiMLDocument::gatherDigits', chalk.gray(`- Timeout: ${opts.timeout}s`));

    return {terminal: true};
  }


  // ----- <Dial> --------------------------------------------------------------

  private static readonly DIAL_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::dial',
      label: 'options'
    },
    type: 'object',
    properties: {
      // The number to dial.
      value: {type: 'string'},
      action: {type: 'string'},
      method: {type: 'string', enum: TWILIO_HTTP_METHODS},

      answerOnBridge: {type: 'boolean'},
      callerId: {type: 'string'},
      hangupOnStar: {type: 'boolean'},
      record: {type: 'string', enum: ['do-not-record', 'record-from-answer', 'record-from-ringing', 'record-from-answer-dual', 'record-from-ringing-dual']},
      ringTone: {type: 'string', enum: map(prop('code'), COUNTRIES)},
      timeLimit: {type: 'number', minimum: 0},
      timeout: {type: 'number'},
      trim: {type: 'string', enum: ['trim-silence', 'do-not-trim']},

      // Optional <Client> nouns.
      clients: {
        type: 'array',
        maxItems: 10,
        items: {type: 'string'}
      },

      // Optional <Conference> noun.
      conference: {
        type: 'object',
        properties: {
          // Name of the conference room to join/create.
          value: {type: 'string'},
          beep: {type: 'boolean'},
          startConferenceOnEnter: {type: 'boolean'},
          endConferenceOnExit: {type: 'boolean'},
          waitUrl: {type: 'string'},
          waitMethod: {type: 'string', enum: TWILIO_HTTP_METHODS},
          maxParticipants: {type: 'number', minimum: 2, maximum: 250},
          record: {type: 'string', enum: ['record-from-start', 'do-not-record']},
          region: {type: 'string', enum: ['us1', 'ie1', 'de1', 'sg1', 'br1', 'au1', 'jp1']},
          trim: {type: 'string', enum: ['trim-silence', 'do-not-trim']},
          coach: {type: 'string'}
        },
        required: ['value']
      },

      // Optional <Queue> noun.
      queue: {
        type: 'object',
        properties: {
          // Name of the queue to pull a waiting caller from.
          value: {type: 'string'},
          url: {type: 'string'},
          method: {type: 'string', enum: TWILIO_HTTP_METHODS},
          reservationSid: {type: 'string'},
          postWorkActivitySid: {type: 'string'}
        },
        required: ['value']
      },

      // Optional <Sim> noun.
      sim: {type: 'string'},

      // Optional <Sip> noun.
      sip: {
        type: 'object',
        properties: {
          // SIP endpoint to call.
          value: {type: 'string'},
          url: {type: 'string'},
          method: {type: 'string', enum: TWILIO_HTTP_METHODS}
        },
        required: ['value']
      }
    },
    required: ['value'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to dial the provided number.
   *
   * See: https://www.twilio.com/docs/api/twiml/dial?code-language=js
   */
  async dial(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    const dialNouns = ['clients', 'conference', 'queue', 'sim', 'sip'];

    this._renderCheck();

    const {voiceUrl, voiceMethod} = locals.get('config');

    const opts = await this._parseOptions(optsOrOptsFn, {
      action: voiceUrl,
      method: voiceMethod,
      timeout: DEFAULT_TIMEOUT
    });

    validate(TwiMLDocument.DIAL_SCHEMA, opts);

    if (!isValidPhoneNumber(opts.value)) {
      throw new TypeError(`[TwiMLDocument::dial] Provided value is not a valid phone number: "${opts.value}"`);
    }

    // Ensure we have a valid "callerId" attribute before proceeding.
    opts.callerId = await this._computeSourceNumber(opts.callerId);

    // Omit "value" and any nouns from options when initializing the verb.
    const dial = this._twiml.dial(omit(dialNouns.concat('value'), opts));

    log.info('TwiMLDocument::dial', `Dialing: "${chalk.bold(opts.value)}".`);
    log.verbose('TwiMLDocument::dial', chalk.dim(`- Caller ID: "${opts.callerId}".`));

    // Add the <Number> noun.
    if (opts.value) {
      dial.number(opts.value);
    }

    // Add any <Client> nounts.
    if (opts.clients) {
      opts.clients.forEach((client: string) => {
        dial.client(client);
        log.verbose('TwiMLDocument::dial', chalk.dim(`- Client: "${client}".`));
      });
    }

    // Add <Conference> noun.
    if (opts.conference) {
      dial.conference(omit(['value'], opts.conference), opts.conference.value);
      log.verbose('TwiMLDocument::dial', chalk.dim(`- Conference: "${opts.conference.value}".`));
    }

    // Add <Queue> noun.
    if (opts.queue) {
      dial.queue(omit(['value'], opts.queue), opts.queue.value);
      log.verbose('TwiMLDocument::dial', chalk.dim(`- Queue: "${opts.queue.value}".`));
    }

    // Add <Sim> noun.
    if (opts.sim) {
      dial.sim(opts.sim);
      log.verbose('TwiMLDocument::dial', chalk.dim(`- SIM: "${opts.sim}".`));
    }

    // Add <Sip> noun.
    if (opts.sip) {
      dial.sip(omit(['value'], opts.sip), opts.sip.value);
      log.verbose('TwiMLDocument::dial', chalk.dim(`- SIP: "${opts.sip.value}".`));
    }

    // By providing "terminal: true" here, the call executor will pause the call
    // after connecting the third party, and Twilio will then hang up the call
    // when the third party disconnects, provided this directive was used at the
    // end of a call script.

    // TODO: Allow users to provide verbs following a <Dial> verb.
    return {terminal: true};
  }


  async forwardCall(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    return this.dial(optsOrOptsFn);
  }


  // ----- <Sms> (deprecated) --------------------------------------------------

  private static readonly SMS_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::sendSms',
      label: 'options'
    },
    type: 'object',
    properties: {
      // Body of the message.
      value: {type: 'string'},
      to: {type: 'string'},
      from: {type: 'string'}
    },
    required: ['value', 'to', 'from'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to send an SMS to the provided number.
   *
   * See: https://www.twilio.com/docs/api/twiml/sms?code-language=js
   */
  async sendSms(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const opts = await this._parseOptions(optsOrOptsFn);

    validate(TwiMLDocument.SMS_SCHEMA, opts);

    if (!isValidPhoneNumber(opts.to)) {
      throw new Error('[TwiMLDocument::sendSms] "To" number is not a valid phone number.');
    }

    opts.from = await this._computeSourceNumber(opts.from);

    this._twiml.sms(omit(['value'], opts), opts.value);

    log.info('TwiMLDocument::sendSms', `"${opts.value}"`);
    log.verbose('TwiMLDocument::sendSms', chalk.gray(`- To: "${opts.to}"`));
    log.verbose('TwiMLDocument::sendSms', chalk.gray(`- From: "${opts.from}"`));

    return {terminal: false};
  }


  // ----- <Enqueue> -----------------------------------------------------------

  private static readonly ENQUEUE_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::enqueue',
      label: 'options'
    },
    type: 'object',
    properties: {
      // Name of the queue to place the caller in.
      value: {type: 'string'},
      waitUrl: {type: 'string'},
      waitUrlMethod: {type: 'string', enum: TWILIO_HTTP_METHODS}
    },
    required: ['value'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to enqueue the current caller.
   *
   * See: https://www.twilio.com/docs/voice/twiml/enqueue?code-language=js
   */
  async enqueue(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const {voiceUrl, voiceMethod} = locals.get('config');

    const opts = await this._parseOptions(optsOrOptsFn, {
      waitUrl: voiceUrl,
      waitUrlMethod: voiceMethod
    });

    validate(TwiMLDocument.ENQUEUE_SCHEMA, opts);

    this._twiml.enqueue(omit(['value'], opts), opts.value);

    log.info('TwiMLDocument::enqueue', `"${opts.value}"`);
    log.verbose('TwiMLDocument::enqueue', chalk.gray(`- waitUrlMethod: "${opts.waitUrlMethod}"`));
    log.verbose('TwiMLDocument::enqueue', chalk.gray(`- waitUrl: "${opts.waitUrl}"`));

    await this.redirect({});

    return {terminal: true};
  }


  // ----- <Leave> -------------------------------------------------------------

  leave(): TwiMLReturnValue {
    this._renderCheck();

    this._twiml.leave();

    log.info('TwiMLDocument::leave', 'Leaving current queue.');

    return {terminal: true};
  }


  // ----- <Pause> -------------------------------------------------------------

  private static readonly PAUSE_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::pause',
      label: 'options'
    },
    type: 'object',
    properties: {
      length: {type: 'number', minumum: 0}
    },
    required: ['length'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to pause for the provided number of
   * seconds.
   *
   * See: https://www.twilio.com/docs/voice/twiml/pause?code-language=js
   */
  async pause(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const opts = await this._parseOptions(optsOrOptsFn);

    validate(TwiMLDocument.PAUSE_SCHEMA, opts);

    this._twiml.pause(opts);

    log.info('TwiMLDocument::pause', `"${opts.length}"`);

    return {terminal: false};
  }


  // ----- <Redirect> ----------------------------------------------------------

  private static readonly REDIRECT_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::redirect',
      label: 'options'
    },
    type: 'object',
    properties: {
      // URL to redirect the caller to.
      value: {type: 'string'},
      method: {type: 'string', enum: TWILIO_HTTP_METHODS}
    },
    required: ['value'],
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to redirect the call to the indicated
   * TwiML document.
   *
   * If no "value" is provided, Twilio will be instructed to re-request the
   * application's voice URL. And, because this directive is 'terminal',
   * Twilight won't move on to the next item in the call script until Twilio
   * makes a new HTTP request. Therefore, this method can be useful for advanced
   * call flow scenarios, like quques.
   *
   * See: https://www.twilio.com/docs/voice/twiml/redirect?code-language=js
   */
  async redirect(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const {voiceUrl, voiceMethod} = locals.get('config');

    const opts = await this._parseOptions(optsOrOptsFn, {
      value: voiceUrl,
      method: voiceMethod
    });

    validate(TwiMLDocument.REDIRECT_SCHEMA, opts);

    this._twiml.redirect(omit(['value'], opts), opts.value);

    log.info('TwiMLDocument::redirect', `"${opts.value}"`);
    log.verbose('TwiMLDocument::redirect', chalk.gray(`- method: "${opts.method}"`));

    return {terminal: true};
  }


  // ----- <Reject> ------------------------------------------------------------

  private static readonly REJECT_SCHEMA = {
    $meta: {
      domain: 'TwiMLDocument::reject',
      label: 'options'
    },
    type: 'object',
    properties: {
      reason: {type: 'string', enum: ['rejected', 'busy']}
    },
    additionalProperties: false
  };


  /**
   * Generates TwiML instructing Twilio to reject the call without billing the
   * current Twilio account.
   *
   * See: https://www.twilio.com/docs/voice/twiml/reject?code-language=js
   */
  async reject(optsOrOptsFn: AbstractDirectiveOptions): Promise<TwiMLReturnValue> {
    this._renderCheck();

    const opts = await this._parseOptions(optsOrOptsFn);

    validate(TwiMLDocument.REJECT_SCHEMA, opts);

    this._twiml.reject(opts);

    log.info('TwiMLDocument::reject', 'Rejecting call.');

    return {terminal: true};
  }


  // ----- <Record> ------------------------------------------------------------

  // TODO: Implement this.


  // ----- <Hangup> ------------------------------------------------------------

  /**
   * Generates TwiML instructing Twilio to end the current call.
   *
   * See: https://www.twilio.com/docs/api/twiml/hangup?code-language=js
   */
  hangUp(): TwiMLReturnValue {
    this._renderCheck();

    // Add a 1-second pause, as hanging-up immediately has a tendency to cut-off
    // audio from a preceding <Say> or <Play> verb.
    this._twiml.pause({length: 1});

    this._twiml.hangup();

    log.info('TwiMLDocument::hangUp', 'Ending call.');

    return {terminal: true};
  }
}
