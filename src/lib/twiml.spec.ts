import locals from 'lib/locals';
import {assertXmlContains} from 'lib/utils';
import TwiMLDocument from './twiml';
import CallExecutor from './call-executor';


// Constants used in tests.
const DEFAULT_APP_NUMBER = '+14155551212';
const FROM_NUMBER = '+14151112222';
const VOICE_METHOD = 'GET';
const VOICE_URL = '/voice';


describe('TwiMLDocument', () => {
  let twiml: any;

  beforeEach(async () => {
    locals.set('config', {
      voiceMethod: VOICE_METHOD,
      voiceUrl: VOICE_URL
    });

    locals.set('twilioClient', {
      async getIncomingPhoneNumbers() {
        return [DEFAULT_APP_NUMBER];
      }
    });

    const req = {
      query: {
        From: FROM_NUMBER
      }
    };

    // @ts-ignore
    const executor = await new CallExecutor(req); // tslint:disable-line await-promise

    twiml = new TwiMLDocument({
      executor
    });
  });

  describe('#say', () => {
    it('should create the correct TwiML', async () => {
      const MESSAGE = 'foo';
      const LANGUAGE = 'en-US';
      const VOICE = 'alice';
      const LOOP = 10;

      await twiml.say({
        value: MESSAGE,
        language: LANGUAGE,
        voice: VOICE,
        loop: LOOP
      });

      assertXmlContains(`
        <Say voice="${VOICE}" language="${LANGUAGE}" loop="${LOOP}">
          ${MESSAGE}
        </Say>
      `, twiml.render());
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.say();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::say] Invalid options');
        }
      });
    });
  });

  describe('#play', () => {
    it('should create the correct TwiML', async () => {
      const FILE = '/foo/bar.baz';
      const LOOP = 10;

      await twiml.play({
        value: FILE,
        loop: LOOP
      });

      assertXmlContains(`
        <Play loop="${LOOP}">${FILE}</Play>
      `, twiml.render());
    });

    describe('using the "digits" attribute', () => {
      it('should render the correct TwiML', async () => {
        const DIGITS = '12345';

        await twiml.play({
          digits: DIGITS
        });

        assertXmlContains(`
          <Play digits="${DIGITS}" />
        `, twiml.render());
      });

      describe('and providing a "value"', () => {
        it('should throw an error', async () => {
          expect.assertions(1);

          const DIGITS = '12345';
          const VALUE = 'foo';

          try {
            await twiml.play({
              value: VALUE,
              digits: DIGITS
            });
          } catch (err) {
            expect(err.message).toMatch('[TwiMLDocument::play] Invalid options');
          }
        });
      });
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.play();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::play] Invalid options');
        }
      });
    });
  });

  describe('#gatherDigits', () => {
    const DIGITS = '12345';
    const FINISH_ON_KEY = '*';
    const HINTS = 'foo, bar';
    const INPUT = 'dtmf';
    const LANGUAGE = 'en-US';
    const PROFANITY_FILTER = true;
    const SPEECH_TIMEOUT = 10;
    const TIMEOUT = 15;

    it('should create the correct TwiML', async () => {
      await twiml.gatherDigits({
        numDigits: DIGITS.length,
        finishOnKey: FINISH_ON_KEY,
        hints: HINTS,
        input: INPUT,
        language: LANGUAGE,
        profanityFilter: PROFANITY_FILTER,
        speechTimeout: SPEECH_TIMEOUT,
        timeout: TIMEOUT
      });

      assertXmlContains(`
        <Gather action="${VOICE_URL}"
          method="${VOICE_METHOD}"
          timeout="${TIMEOUT}"
          numDigits="${DIGITS.length}"
          finishOnKey="${FINISH_ON_KEY}"
          hints="${HINTS}"
          input="${INPUT}"
          language="${LANGUAGE}"
          profanityFilter="${PROFANITY_FILTER}"
          speechTimeout="${SPEECH_TIMEOUT}"
        />
      `, twiml.render());
    });

    describe('providing invalid options', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.gatherDigits({
            numDigits: 'foo'
          });
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::gatherDigits] Invalid options');
        }
      });
    });
  });

  describe('#dial', () => {
    it('should create the correct TwiML', async () => {
      const TO_NUMBER = '+14155554444';
      const RECORD = 'record-from-answer';
      const RINGTONE = 'US';
      const TIME_LIMIT = 15;
      const TIMEOUT = 10;
      const TRIM = 'trim-silence';
      const CLIENTS = ['one', 'two', 'three', 'four'];
      const SIM = 'sim';

      const CONFERENCE = {
        value: 'foo',
        beep: true,
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        waitUrl: 'twilio.com',
        waitMethod: 'GET',
        maxParticipants: 250,
        record: 'record-from-start',
        region: 'us1',
        trim: TRIM,
        coach: 'bar'
      };

      const QUEUE = {
        value: 'baz',
        url: 'twilio.com',
        method: 'GET',
        reservationSid: '54321',
        postWorkActivitySid: '12345'
      };

      const SIP = {
        value: 'sip',
        url: 'twilio.com',
        method: 'GET'
      };

      await twiml.dial({
        value: TO_NUMBER,
        answerOnBridge: true,
        hangupOnStar: true,
        record: RECORD,
        ringTone: RINGTONE,
        timeLimit: TIME_LIMIT,
        timeout: TIMEOUT,
        trim: TRIM,
        clients: CLIENTS,
        conference: CONFERENCE,
        queue: QUEUE,
        sim: SIM,
        sip: SIP
      });

      assertXmlContains(`
        <Dial timeout="${TIMEOUT}"
          answerOnBridge="true"
          hangupOnStar="true"
          record="${RECORD}"
          ringTone="${RINGTONE}"
          timeLimit="${TIME_LIMIT}"
          trim="${TRIM}"
          callerId="${DEFAULT_APP_NUMBER}">
          <Number>${TO_NUMBER}</Number>
          ${CLIENTS.map(client => `<Client>${client}</Client>`).join('')}
          <Conference beep="true"
            startConferenceOnEnter="true"
            endConferenceOnExit="true"
            waitUrl="${CONFERENCE.waitUrl}"
            waitMethod="${CONFERENCE.waitMethod}"
            maxParticipants="${CONFERENCE.maxParticipants}"
            record="${CONFERENCE.record}"
            region="${CONFERENCE.region}"
            trim="${CONFERENCE.trim}"
            coach="${CONFERENCE.coach}">
            ${CONFERENCE.value}
          </Conference>
          <Queue url="${QUEUE.url}"
            method="${QUEUE.method}"
            reservationSid="${QUEUE.reservationSid}"
            postWorkActivitySid="${QUEUE.postWorkActivitySid}">
            ${QUEUE.value}
          </Queue>
          <Sim>${SIM}</Sim>
          <Sip url="${SIP.url}"
            method="${SIP.method}">
            ${SIP.value}
          </Sip>
        </Dial>
      `, twiml.render());
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.dial();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::dial] Invalid options');
        }
      });
    });

    describe('providing an invalid number', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.dial({
            value: 'invalid-phone-number'
          });
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::dial] Provided value is not a valid phone number:');
        }
      });
    });
  });

  describe('#sendSms', () => {
    const TO_NUMBER = '+14155554444';
    const MESSAGE = 'foo';

    it('should create the correct TwiML', async () => {
      await twiml.sendSms({
        value: MESSAGE,
        to: TO_NUMBER,
        from: FROM_NUMBER
      });

      assertXmlContains(`
        <Sms to="${TO_NUMBER}"
          from="${FROM_NUMBER}">
          ${MESSAGE}
        </Sms>
      `, twiml.render());
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.sendSms({
            to: TO_NUMBER
          });
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::sendSms] Invalid options');
        }
      });
    });

    describe('not providing a "to" number', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.sendSms({
            value: MESSAGE
          });
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::sendSms] Invalid options');
        }
      });
    });
  });

  describe('#enqueue', () => {
    const QUEUE_NAME = 'foo';
    const WAIT_URL = 'twilio.com';
    const WAIT_URL_METHOD = 'GET';

    it('should render the correct TwiML', async () => {
      await twiml.enqueue({
        value: QUEUE_NAME,
        waitUrl: WAIT_URL,
        waitUrlMethod: WAIT_URL_METHOD
      });

      assertXmlContains(`
        <Enqueue waitUrl="${WAIT_URL}"
          waitUrlMethod="${WAIT_URL_METHOD}">
          ${QUEUE_NAME}
        </Enqueue>
      `, twiml.render());
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.enqueue();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::enqueue] Invalid options');
        }
      });
    });
  });

  describe('#leave', () => {
    it('should render the correct TwiML', () => {
      twiml.leave();

      assertXmlContains(`
      <Leave />
    `, twiml.render());
    });
  });

  describe('#pause', () => {
    const LENGTH = 20;

    it('should render the correct TwiML', async () => {
      await twiml.pause({
        length: LENGTH
      });

      assertXmlContains(`
        <Pause length="${LENGTH}" />
      `, twiml.render());
    });

    describe('not providing a length param', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.pause();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::pause] Invalid options');
        }
      });
    });
  });

  describe('#redirect', () => {
    const URL = 'twilio.com';
    const METHOD = 'GET';

    it('should render the correct TwiML', async () => {
      await twiml.redirect({
        value: URL,
        method: METHOD
      });

      assertXmlContains(`
        <Redirect method="${METHOD}">${URL}</Redirect>
      `, twiml.render());
    });

    describe('not providing a value', () => {
      it('should throw an error', async () => {
        expect.assertions(1);

        try {
          await twiml.redirect();
        } catch (err) {
          expect(err.message).toMatch('[TwiMLDocument::redirect] Invalid options');
        }
      });
    });
  });

  describe('#reject', () => {
    it('should render the correct TwiML', async () => {
      const REASON = 'busy';

      await twiml.reject({
        reason: REASON
      });

      assertXmlContains(`
      <Reject reason="${REASON}" />
    `, twiml.render());
    });
  });

  describe('#hangUp', () => {
    it('should render the correct TwiML', () => {
      twiml.hangUp();

      assertXmlContains(`
        <Pause length="1" />
        <Hangup />
      `, twiml.render());
    });
  });
});
