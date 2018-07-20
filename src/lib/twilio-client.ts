/**
 * ===== Twilio Client =========================================================
 *
 * Wrapper for the Twilio client that acts as a single target for application
 * SID, account SID, and auth token. If the optional application SID is not
 * provided, Twilight will not be able to look-up appropriate phone numbers to
 * use in certain scenarios (see twiml.ts).
 */
// @ts-ignore
import twilio from 'twilio';
import {filter, map, prop, propEq} from 'ramda';


export interface TwilioClientParams {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioApplicationSid?: string;
}


/**
 * Abstraction of the Node Twilio client.
 */
export default class TwilioClient {
  private readonly _client: twilio.RestClient;
  private readonly _applicationSid?: string;


  constructor({twilioAccountSid, twilioAuthToken, twilioApplicationSid}: TwilioClientParams) {
    this._applicationSid = twilioApplicationSid;

    // Perform runtime type-check of params.
    if (!twilioAccountSid) {
      throw new Error('[TwilioClient] Account SID required.');
    }

    if (!twilioAuthToken) {
      throw new Error('[TwilioClient] Auth token required.');
    }

    this._client = twilio(twilioAccountSid, twilioAuthToken);
  }


  /**
   * Returns an array of phone numbers that point to this application.
   */
  async getIncomingPhoneNumbers(): Promise<Array<string>> {
    if (!this._applicationSid) {
      throw new Error('[TwilioClient::getIncomingPhoneNumbers] Client was constructed without an "applicationSid" param; cannot get incoming phone numbers for this application.');
    }

    const twilioNumbers = await this._client.incomingPhoneNumbers.list();
    const appNumbers = filter(propEq('voiceApplicationSid', this._applicationSid), twilioNumbers);

    return map(prop('phoneNumber'), appNumbers);
  }
}
