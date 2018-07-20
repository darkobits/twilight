import express from 'express';
import R from 'ramda';
import req from 'supertest';
import uuid from 'uuid/v4';

import {DEFAULT_TIMEOUT} from 'etc/constants';
import {LooseObject} from 'etc/types';
import {assertXmlContains} from 'lib/utils';
import router from './router';

// Mock-out TwilioClient.
jest.mock('lib/twilio-client', () => {
  return class MockTwilioClient {
    async getIncomingPhoneNumbers() {
      return ['+14155551111'];
    }
  };
});

// Constants used in tests.
const VOICE_METHOD = 'GET';
const VOICE_URL = '/voice';
const TWILIO_ACCOUNT_SID = `AC${uuid().replace(/-/g, '')}`;
const TWILIO_APPLICATION_SID = `AP${uuid().replace(/-/g, '')}`;
const TWILIO_AUTH_TOKEN = uuid().replace(/-/g, '');
const FROM_NUMBER = '+14155551111';
const PRIMARY_PHONE_NUMBER = '+14155552222';
const TO_NUMBER = '+14155553333';

// Constants for the sendDigits test.
const SEND_DIGITS_TEST = '+14155554444';
const SEND_DIGITS_VALUE = '42';

// Constants for the say test.
const SAY_VALUE = uuid();

// Prepare our test "database" with the above data.
const data: LooseObject = {
  [FROM_NUMBER]: [
    ['say', {
      value: SAY_VALUE
    }]
  ],
  [SEND_DIGITS_TEST]: [
    ['sendDigits', {
      value: SEND_DIGITS_VALUE
    }]
  ]
};

// Create an Express app and add our router to it.
const app = express();


app.use(router({
  voiceMethod: VOICE_METHOD,
  voiceUrl: VOICE_URL,
  logLevel: 'error',
  primaryPhoneNumber: PRIMARY_PHONE_NUMBER,
  twilioAccountSid: TWILIO_ACCOUNT_SID,
  twilioApplicationSid: TWILIO_APPLICATION_SID,
  twilioAuthToken: TWILIO_AUTH_TOKEN,
  callDataFn(callerId: string, cb: Function) {
    if (data[callerId]) {
      cb(undefined, data[callerId]);
    } else {
      cb(undefined, null);
    }
  }
}));


/**
 * Simulates a request to Twilight coming from Twilio.
 */
function request(params: object) {
  return req(app)
    .get(VOICE_URL)
    .set('Accept', 'application/xml')
    .set('X-Forwarded-Proto', 'https')
    .query({
      AccountSid: TWILIO_ACCOUNT_SID,
      ApplicationSid: TWILIO_APPLICATION_SID,
      CallSid: uuid(),
      // From: FROM_NUMBER,
      To: TO_NUMBER,
      ...params
    });
}


describe('router', () => {
  describe('Hello World', () => {
    it('should say "Hello world."', async () => {
      return request({
        From: FROM_NUMBER
      })
        .expect(200)
        .then(R.prop('text'))
        .then(assertXmlContains(`
        <Say voice="woman"
          language="en-GB">
          ${SAY_VALUE}
        </Say>
        <Pause length="1" />
        <Hangup />
      `));
    });
  });

  describe('Call Data Not Found', () => {
    it('should forward the call to the primary phone number', async () => {
      return request({})
        .expect(200)
        .then(R.prop('text'))
        .then(assertXmlContains(`
          <Dial timeout="${DEFAULT_TIMEOUT}"
            callerId="${FROM_NUMBER}">
            <Number>${PRIMARY_PHONE_NUMBER}</Number>
          </Dial>
        `));
    });
  });

  describe('Invalid requests', () => {
    it('should return a 400 error', async () => {
      return request({
        ApplicationSid: false,
        AccountSid: false
      })
        .expect(400);
    });
  });

  describe('Send Digits & Hang Up', () => {
    it('should send digits and end the call', async () => {
      return request({
        From: SEND_DIGITS_TEST
      })
        .expect(200)
        .then(R.prop('text'))
        .then(assertXmlContains(`
        <Play digits="${SEND_DIGITS_VALUE}" />
        <Pause length="1" />
        <Hangup />
      `));
    });
  });
});
