/**
 * ===== Active Call Manager ===================================================
 *
 * This class is what manages all active calls currently in progress. At root,
 * it is a Map of Twilio CallSids to Twilight CallExecutor instances. It is
 * responsible for creating new CallExecutor instances for new calls, and for
 * removing entries for completed calls so that they can be garbage-collected.
 */
import {Request} from 'express';

import CallExecutor from 'lib/call-executor';
import log from 'lib/log';


/**
 * Manages active calls being handled by the server using a Map. Calls are keyed
 * by their SID, and each value is an instance of a CallExecutor, which manages
 * the internal state of each individual call.
 */
export default class ActiveCalls {
  private readonly _activeCalls: Map<string, CallExecutor> = new Map();


  /**
   * Provided an Express request, creates a new call or returns an existing one
   * from the active calls Map.
   */
  async getOrCreateCall(req: Request): Promise<CallExecutor> {
    const {CallSid}: {CallSid: string} = req.query;

    const existingCall = this._activeCalls.get(CallSid);

    if (existingCall) {
      if (existingCall.isPaused()) {
        log.verbose('ActiveCalls::getOrCreateCall', `Resuming paused call: ${CallSid}.`);
      } else {
        log.warn('ActiveCalls::getOrCreateCall', `Resuming call that was not paused: ${CallSid}.`);
      }

      return existingCall;
    }

    const newCall = await new CallExecutor(req); // tslint:disable-line await-promise

    this._activeCalls.set(CallSid, newCall);

    log.info('ActiveCalls::getOrCreateCall', `Created executor for call: ${CallSid}.`);
    log.verbose('ActiveCalls::getOrCreateCall', `Active calls: ${this._activeCalls.size}.`);

    return newCall;
  }


  /**
   * Provided an Express request, removes a call from the active calls Map. If
   * the CallStatus parameter in the request is not "completed", or if the call
   * does not exist in the active calls Map, an error is throw. If the call's
   * internal status is not "completed", a warning is issued.
   */
  removeCall(req: Request) {
    const {CallStatus, CallSid}: {CallStatus: string; CallSid: string} = req.query;

    if (CallStatus !== 'completed') {
      throw new Error(`[ActiveCalls::removeCall] CallStatus in request is not "completed". (CallSid: ${CallSid})`);
    }

    if (!this._activeCalls.has(CallSid)) {
      log.warn('[ActiveCalls::removeCall]', `Unknown call: ${CallSid}.`);
      return;
    }

    const call = this._activeCalls.get(CallSid);

    if (call && call.isCompleted()) {
      log.info('ActiveCalls::removeCall', `Removing completed call: ${CallSid}.`);
    } else {
      // This may be caused by premature hang-ups.
      log.warn('ActiveCalls::removeCall', `Removing incomplete call: ${CallSid}.`);
    }

    this._activeCalls.delete(CallSid);
  }
}
