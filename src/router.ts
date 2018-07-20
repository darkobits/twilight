import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {allPass, equals, merge, propSatisfies} from 'ramda';

import {DEFAULT_METHOD} from 'etc/constants';
import {CONFIG_SCHEMA} from 'etc/schemas';
import {TwilightConfiguration, IndexableRouter} from 'etc/types';
import {validate} from 'lib/ajv';
import ActiveCalls from 'lib/active-calls';
import log from 'lib/log';
import locals from 'lib/locals';
import TwilioClient from 'lib/twilio-client';


/**
 * Creates a new Twilight server. Accepts a config object with the following:
 */
export default function TwilightRouter(config: TwilightConfiguration): IndexableRouter {
  /**
   * Express router we will attach endpoints to and return to the consumer.
   */
  const router: IndexableRouter = express.Router();


  /**
   * Validate and set configuration.
   */
  locals.set('config', validate(CONFIG_SCHEMA, {
    twilioAccountSid: '',
    twilioApplicationSid: '',
    twilioAuthToken: '',
    voiceMethod: DEFAULT_METHOD,
    voiceUrl: '/voice',
    statusMethod: DEFAULT_METHOD,
    statusUrl: '/status',
    logLevel: 'info',
    allowInsecure: false,
    ...config
  }));


  /**
   * Twilio client instance.
   */
  locals.set('twilioClient', new TwilioClient({
    twilioAccountSid: locals.get('config.twilioAccountSid'),
    twilioAuthToken: locals.get('config.twilioAuthToken'),
    twilioApplicationSid: locals.get('config.twilioApplicationSid')
  }));


  /**
   * Tracks current calls.
   */
  const activeCalls = new ActiveCalls();


  /**
   * Express middleware used to ensure a request originated from Twilio. This is
   * used instead of the official request validation middleware because it
   * requires that we know the public URL that Twilio used to access this
   * server, which is not always the case.
   */
  async function validateTwilioRequest(req: Request, res: Response, next: Function) {
    // The fields we want to inspect may be query string parameters for GET
    // requests or part of the body for POST requests.
    const mergedReq = merge(req.query, req.body);

    const isSecure = req.protocol === 'https' || req.get('X-Forwarded-Proto') === 'https';

    // Create predicates that will return true if the object they are provided
    // has AccountSid and ApplicationSid properties that match our config.
    const hasValidAccountSid = propSatisfies(equals(locals.get('config.twilioAccountSid')), 'AccountSid');
    const hasValidApplicationSid = propSatisfies(equals(locals.get('config.twilioApplicationSid')), 'ApplicationSid');

    let isValid;

    if (process.env.NODE_ENV === 'production') {
      // In production, we ensure the connection is secure and validate both the
      // account SID and application SID.
      isValid = isSecure && allPass([hasValidAccountSid, hasValidApplicationSid])(mergedReq);
    } else {
      // In development, we only allow HTTP and only validate the account SID
      // because the user may be developing using a non-production application
      // SID.
      isValid = hasValidAccountSid(mergedReq);
    }

    if (isValid) {
      res.set('Content-Type', 'application/xml');
      next();
    } else {
      log.warn('validateTwilioRequest', 'Request is not a valid Twilio request.');
      res.sendStatus(400);
    }
  }


  // ----- Initialization ------------------------------------------------------

  // Set the log level.
  log.level = locals.get('config.logLevel');

  // N.B. This *must* be installed before the Twilio validator middleware.
  router.use(bodyParser.urlencoded({extended: true}));

  if (!locals.get('config.allowInsecure')) {
    log.info('twilio', 'Installing Twilio request validator.');
    // router.use(validateTwilioRequest);
  }


  // ----- Create Voice Route --------------------------------------------------

  /**
   * This is the route Twilio should use to request TwiML documents for
   * incoming calls.
   */

  const VOICE_METHOD = locals.get('config.voiceMethod').toLowerCase();
  const VOICE_URL = locals.get('config.voiceUrl');

  router[VOICE_METHOD](VOICE_URL, validateTwilioRequest, async (req: Request, res: Response) => {
    const logLabel = `${VOICE_METHOD.toUpperCase()}:${VOICE_URL}`;
    log.verbose(logLabel, `Incoming call from "${req.query.From}".`);

    try {
      // Try to advance the call.
      const executor = await activeCalls.getOrCreateCall(req);
      res.send(await executor.advance(req));
      return;
    } catch (err) {
      log.error(logLabel, err.stack);
      res.status(500).json({
        error: err.message
      });
    }
  });


  // ----- Create Status Callback Route ----------------------------------------

  const STATUS_METHOD = locals.get('config.statusMethod').toLowerCase();
  const STATUS_URL = locals.get('config.statusUrl');

  router[STATUS_METHOD](STATUS_URL, validateTwilioRequest, async (req: Request, res: Response) => {
    const logLabel = `${STATUS_METHOD.toUpperCase()}:${STATUS_URL}`;

    try {
      activeCalls.removeCall(req);
      res.sendStatus(200);
    } catch (err) {
      log.error(logLabel, err);
      res.sendStatus(500);
    }
  });

  return router;
}
