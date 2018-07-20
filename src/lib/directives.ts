/**
 * ===== Directives ============================================================
 *
 * Directives are functions that accept user input and return a 2-tuple array
 * with the shape:
 *
 * [directiveName: string, directiveOptions: function | object]
 *
 * Call Executors will resolve directives to these arrays, determine which
 * TwiML method to call, and invoke it with the user's options.
 *
 * Usage of directive functions is entirely optional, but is probably the most
 * convenient way to write call scripts.
 */
import isPlainObject from 'is-plain-object';
import {DirectiveDescriptor} from 'etc/types';


/**
 *
 * Provided a directive name, returns a function that accepts a value and
 * returns an array that may be used as part of a call script. This provides a
 * way for users to create dynamic call scripts if serialization is not a
 * priority.
 *
 * The optional "defaultAttribute" param can be used to set argument provided to
 * the directive to a specific key on the options object created.
 */
function DirectiveFactory(directiveName: string, defaultAttribute?: string): (value?: any) => DirectiveDescriptor {
  return function DirectiveFunction(value?) {
    return [
      directiveName,
      (...args) => {
        // console.warn('THROWING AWAY THE FOLLOWING ARGS:', args);

        // If the value supplied is a plain object, return it.
        if (isPlainObject(value)) {
          return value;
        }

        // If any other type was provided, return an object with the provided
        // value as the 'value' key.
        return {
          [defaultAttribute || 'value']: value
        };
      }
    ];
  };
}


export const dial = DirectiveFactory('dial');
export const enqueue = DirectiveFactory('enqueue');
export const gatherDigits = DirectiveFactory('gatherDigits', 'numDigits');
export const hangUp = DirectiveFactory('hangUp');
export const leave = DirectiveFactory('leave');
export const pause = DirectiveFactory('pause', 'length');
export const play = DirectiveFactory('play');
export const redirect = DirectiveFactory('redirect');
export const reject = DirectiveFactory('reject');
export const say = DirectiveFactory('say');
export const sendDigits = DirectiveFactory('sendDigits');
export const sendSms = DirectiveFactory('sendSms');


export default {
  dial,
  enqueue,
  gatherDigits,
  hangUp,
  leave,
  pause,
  play,
  redirect,
  reject,
  say,
  sendDigits,
  sendSms,
};
