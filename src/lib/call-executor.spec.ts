import {Request} from 'express';
import {DEFAULT_TIMEOUT} from 'etc/constants';
import CallExecutor from 'lib/call-executor';
import locals from 'lib/locals';
import {assertXmlContains} from 'lib/utils';


// Constants used in tests.
const DEFAULT_APP_NUMBER = '+14155551212';
const FROM_NUMBER = '+14151112222';
const TO_NUMBER = '+14151113333';
const VOICE_METHOD = 'GET';
const VOICE_URL = '/voice';


describe('CallExecutor', () => {
  let executor: CallExecutor;

  beforeEach(async () => {
    const callScript = [
      ['dial', {
        value: TO_NUMBER
      }]
    ];

    locals.set('config', {
      voiceMethod: VOICE_METHOD,
      voiceUrl: VOICE_URL,
      callDataFn(phoneNumber: string, cb: Function) { // tslint:disable-line no-unused
        cb(null, callScript);
      }
    });

    locals.set('twilioClient', {
      async getIncomingPhoneNumbers() {
        return [DEFAULT_APP_NUMBER];
      }
    });

    // Mock express request.
    const initialReq = {
      query: {
        From: FROM_NUMBER,
        To: TO_NUMBER
      }
    } as Request;

    executor = await new CallExecutor(initialReq); // tslint:disable-line await-promise
  });


  it('should advance the call and return a TwiML document', async () => {
    const result = await executor.advance({
      query: {
        From: FROM_NUMBER,
        To: TO_NUMBER
      }
    } as Request);

    assertXmlContains(`
      <Dial action="${VOICE_URL}"
        method="${VOICE_METHOD}"
        timeout="${DEFAULT_TIMEOUT}"
        callerId="${DEFAULT_APP_NUMBER}">
        <Number>${TO_NUMBER}</Number>
      </Dial>
    `, result);
  });
});
