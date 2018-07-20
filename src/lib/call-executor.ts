/**
 * ===== Call Executor =========================================================
 *
 * A CallExecutor is created for each incoming call received by Twilight, and is
 * responsible for retrieving user-provided call scripts, managing call state,
 * and for transforming call scripts into "directive descriptors" that
 * Twilight's TwiML generator can use to create TwiML documents.
 */
import chalk from 'chalk';
import {Request} from 'express';
import {once} from 'ramda';

import {
  AbstractCallScriptArray,
  CallScriptArray,
  CallScriptItem,
  DirectiveDescriptor
} from 'etc/types';

import {
  DIRECTIVE_DESCRIPTOR_SCHEMA,
  CALL_SCRIPT_ARRAY_SCHEMA
} from 'etc/schemas';

import {validate} from 'lib/ajv';
import CallScript, {CallScriptConstructor} from 'lib/call-script';
import TwiMLDocument, {TwiMLReturnValue} from 'lib/twiml';
import locals from 'lib/locals';
import log from 'lib/log';


/**
 * This class manages state for a single call. It is constructed with the
 * initial Express request that triggered the call.
 */
export default class CallExecutor {
  /**
   * Express request that triggered the creation of this instance.
   */
  private readonly _initlalReq: Request;


  /**
   * Current script being executed.
   */
  private _callScript: CallScriptArray;


  /**
   * Whether the call is paused. A call is paused if it has issued a terminal
   * segment with a resume handler and is waiting to receive user input in a
   * subsequent HTTP request from Twilio.
   */
  private _paused = false;


  /**
   * Whether the call has completed. A call is completed if it has issued a
   * terminal segment without a resume handler or if the last segment in the
   * call script has been reached.
   */
  private _completed = false;


  /**
   * Tracks the current position in the call script array.
   */
  private _index = 0;


  /**
   * Constructs a new CallExecutor using the provided script array.
   *
   * Note: This is an asynchronous constructor and must be await-ed/then-ed.
   */
  constructor(initialReq: Request, initialCallScript?: CallScriptArray) {
    this._initlalReq = initialReq;

    // @ts-ignore
    return new Promise(async (resolve, reject) => {
      try {
        if (!initialCallScript) {
          const callDataFn = locals.get('config.callDataFn');
          const callScript = await this._getCallScript(callDataFn, initialReq.query.From);

          if (!callScript) {
            throw new Error(`[CallExecutor::constructor] No call script returned for "${initialReq.query.From}".`);
          }

          await this._setCallScript(callScript, initialReq);

          log.verbose('CallExecutor', [
            'Created new call executor for',
            chalk.bold(initialReq.query.From),
            '=>',
            chalk.bold(initialReq.query.To || 'N/A')
          ].join(' '));
        } else {
          const callScript = initialCallScript;
          await this._setCallScript(callScript, initialReq);
          log.verbose('CallExecutor', 'Created new call executor from provided call script');
        }

        resolve(this);
      } catch (err) {
        reject(new Error(`[CallExecutor] Error creating executor: ${err.stack}`));
      }
    });
  }


  /**
   * Defers to configured call data function to provide the script for the
   * provided caller ID.
   */
  private async _getCallScript(configuredDataGetter: Function, callerId: string): Promise<AbstractCallScriptArray> {
    return new Promise(async (resolve: (cs: AbstractCallScriptArray) => void, reject) => {
      const resolveOnce = once(resolve);
      const rejectOnce = once(reject);

      const callback = (err: Error, data: AbstractCallScriptArray) => {
        if (err) {
          rejectOnce(err);
        } else {
          resolveOnce(data);
        }
      };

      try {
        // Invoke the user's call script function. If it returns a value, assume
        // it is not a continuation-passing-style function and resolve with its
        // return value. Otherwise, we will resolve when the user invokes the
        // above callback.
        const returnValue = await configuredDataGetter(callerId, callback);

        if (returnValue) {
          resolveOnce(returnValue);
        }
      } catch (err) {
        log.error('CallExecutor::getCallScript', `Raw error message: ${err.stack}`);
        rejectOnce(new Error(`No call script found for number "${callerId}".`));
      }
    });
  }


  /**
   * Accepts a call script, a function that returns a call script, or a promise
   * that resolves with a call script. If the script is valid, is it set on the
   * instance. Otherwise, an error is thrown.
   */
  private async _setCallScript(value: AbstractCallScriptArray, req: Request): Promise<any>;
  private async _setCallScript(value: CallScriptConstructor, req: Request): Promise<any>;
  private async _setCallScript(value: CallScriptArray, req: Request): Promise<any>;
  private async _setCallScript(value: CallScript, req: Request): Promise<any>;
  private async _setCallScript(value: any, req: Request): Promise<any> {
    // ----- [a] Handle CallScript Classes -------------------------------------
    if (typeof value === 'function' && (value.prototype instanceof CallScript)) {
      log.silly('CallExecutor::setCallScript', 'Created new CallScript instance.');
      return this._setCallScript(new (value as CallScriptConstructor)(locals.get('twilioClient')), req);
    }


    // ----- [b] Handle CallScript Instances -----------------------------------

    if (value instanceof CallScript) {
      if (typeof value.root === 'function') {
        log.silly('CallExecutor::setCallScript', 'Got CallScript instance. Recursing with return value of its "root" method.');
        return this._setCallScript(await value.root(req), req);
      }

      if (Array.isArray(value.root)) {
        log.silly('allExecutor::setCallScript', 'Got CallScript instance. Recursing with its "root" instance member.');
        return this._setCallScript(value.root, req);
      }

      throw new TypeError(`[CallExecutor::setCallScript] CallScript instance's "root" member must be of type "array", got "${typeof value.root}".`);
    }


    // ----- [c] Handle Functions/Methods --------------------------------------

    if (typeof value === 'function') {
      log.silly('CallExecutor::setCallScript', 'Got type "function". Recursing with its return value.');
      return this._setCallScript(await (value as Function)(req), req);
    }


    // ----- [d] Handle Strings ------------------------------------------------

    if (typeof value === 'string') {
      log.silly('CallExecutor::setCallScript', 'Got type "string". Recursing with its deserialized value.');

      try {
        const parsedScript = JSON.parse(value);
        return this._setCallScript(parsedScript, req);
      } catch (err) {
        throw new TypeError(`[CallExecutor::setCallScript] String is not valid JSON: ${err.message}`);
      }
    }


    // ----- [e] Handle Arrays -------------------------------------------------

    if (Array.isArray(value)) {
      log.silly('CallExecutor::setCallScript', 'Got type "array". Validating it against schema.');
      validate(CALL_SCRIPT_ARRAY_SCHEMA, value);
      log.silly('CallExecutor::setCallScript', 'Array is a valid CallScriptArray.');
      this._callScript = value;
      return;
    }


    // ----- [f] Handle All Other Types ----------------------------------------

    throw new TypeError(`[CallExecutor::setCallScript] Expected type of call script to be one of "function", "string", or "array", got "${typeof value}".`);
  }


  /**
   * Used by CallExecutor#advance to resolve CallScriptItems to
   * DirectiveDescriptors.
   */
  private async _resolveCallScriptItem(value: CallScriptItem, req: Request): Promise<DirectiveDescriptor> {
    // ----- [a] Handle Functions/Methods --------------------------------------

    if (typeof value === 'function') {
      log.silly('CallExecutor::resolveCallScriptItem', 'Got type "function", Recursing with its return value.');
      return this._resolveCallScriptItem(await value(req), req);
    }


    // ----- [b] Handle Strings ------------------------------------------------

    if (typeof value === 'string') {
      log.silly('CallExecutor::resolveCallScriptItem', 'Got type "string". Recursing with its deserialized value.');

      try {
        const parsedItem = JSON.parse(value);
        return this._resolveCallScriptItem(parsedItem, req);
      } catch (err) { // tslint:disable-line no-unused
        throw new TypeError('[CallExecutor::resolveCallScriptItem] String is not valid JSON.');
      }
    }


    // ----- [c] Handle Arrays -------------------------------------------------

    if (Array.isArray(value)) {
      log.silly('CallExecutor::resolveCallScriptItem', 'Got type "array". Validating it against schema.');

      try {
        validate(DIRECTIVE_DESCRIPTOR_SCHEMA, value);
        log.silly('CallExecutor::resolveCallScriptItem', 'Array is a valid DirectiveDescriptor.');
        return value;
      } catch (err) { // tslint:disable-line no-unused
        log.silly('CallExecutor::resolveCallScriptItem', 'Array is not a valid DirectiveDescriptor.');
      }

      try {
        log.silly('CallExecutor::resolveCallScriptItem', 'Attempting to set array as new call script.');
        await this._setCallScript(value, req);

        // Reset the index so that the next iteration of the for-loop in
        // #advance will point to the correct item.
        this._index = 0;

        // Recurse, passing the first item in the new call script array.
        return this._resolveCallScriptItem(this._callScript[this._index], req);

        // this._callScript = insertAll(this._index, value, remove(this._index, 1, this._callScript));
      } catch (err) { // tslint:disable-line no-unused
        throw new Error('[CallExecutor::resolveCallScriptItem] Item of type "array" is neither a valid DirectiveDescriptor nor a valid CallScriptArray.');
      }
    }

    throw new TypeError(`[CallExecutor::resolveCallScriptItem] Expected type of call script item to be one of "function", "string", or "array", got "${typeof value}".`);
  }


  /**
   * Accepts an Express request, creates a new TwiMLDocument, and iterates
   * through the instance's call script, passing each DirectiveDescriptor to the
   * appropriate TwiMLDocument instance method. Once a terminal directive is
   * reached (according to the return values from TwiMLDocument methods), the
   * TwiMLDocument is rendered and returned to the callee.
   */
  async advance(req: Request): Promise<string> {
    if (!this._callScript) {
      throw new Error('[CallExecutor::advance] No call script has been set.');
    }

    if (this._completed) {
      throw new Error('[CallExecutor::advance] Trying to advance a completed call.');
    }

    this._paused = false;

    // Create a new TwiML document that will be sent back to Twilio to respond
    // to the current request.
    const twimlDocument = new TwiMLDocument({
      executor: this
    });

    // Iterate through our call script, starting at the last-known index.
    for (this._index; this._index < this._callScript.length; this._index++) {
      // Resolve each item to a valid DirectiveDescriptor tuple.
      const [directive, directiveOptions] = await this._resolveCallScriptItem(this._callScript[this._index], req);

      // Ensure the descriptor specifies a valid TwiMLDocument method.
      if (!Reflect.has(twimlDocument, directive)) {
        throw new Error(`[CallExecutor::advance] Invalid directive: "${directive}".`);
      }

      // Update the TwiML document by invoking the method specified by the
      // descriptor with the provided options (function or object).
      const {terminal}: TwiMLReturnValue = await twimlDocument[directive](directiveOptions);

      // If the directive indicated it was non-terminal, skip the rest of the
      // loop and continue to the next iteration.
      if (!terminal) {
        continue;
      }

      // If the directive indicated it was terminal, pause the call and break
      // out of the loop.
      this._paused = true;
      ++this._index;
      break;
    }

    if (!this.isPaused() && !this.isCompleted()) {
      // If we reached the end of the loop without pausing the call, it means we
      // have reached the end of the call script without encountering a terminal
      // directive, in which case there is an implicit hang-up.

      // Note: This was disabled in order to support parseCallScriptImmediately.
      // If having it disabled causes issues, determine how to re-enable it.
      // twimlDocument.hangUp();

      // Set the call state to completed so it cannot be resumed later.
      this._completed = true;
    }

    // If we get to this point, we've reached a terminal directive. Render the
    // TwiML document and return it to the callee.
    return twimlDocument.render();
  }


  /**
   * Returns true if the call is currently paused (awaiting user input via
   * another HTTP request from Twilio).
   */
  isPaused(): boolean {
    return this._paused;
  }


  /**
   * Returns true if the call is completed (reached the end of its script
   * and cannot be advanced further).
   */
  isCompleted(): boolean {
    return this._completed;
  }


  /**
   * Provided a request and a call script array, returns a TwiML document. This
   * method is designed to be used to handle the generation of TwiML for nested
   * verbs, as can be done with <Gather>.
   *
   * Unlike normal parsing of call scripts, directives used here must not be
   * terminal, since there will not be a response/request cycle between TwiML
   * generation.
   */
  async parseCallScriptImmediately(callScript: CallScriptArray): Promise<string> {
    const pattern = /<Response>([\s\S]*)<\/Response>/g;
    const executor = await new CallExecutor(this._initlalReq, callScript); // tslint:disable-line await-promise
    const twimlDocument = await executor.advance(this._initlalReq);

    if (!executor.isCompleted()) {
      throw new Error('[CallExecutor#parseCallScriptImmediately] Encountered a terminal directive before reaching the end of the script.');
    }

    const results = pattern.exec(twimlDocument);

    if (!results) {
      throw new Error('[CallExecutor#parseCallScriptImmediately] Encountered an error while parsing TwiML.');
    }

    return results[1];
  }
}
