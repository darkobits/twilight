/**
 * ===== Call Script Base Class ================================================
 *
 * This is the base class for call scripts. One of many ways user's may provide
 * a call script to Twilight is by providing an instance of a subclass of
 * CallScript.
 *
 * When a new CallScript is created, each of its methods are bound to the
 * instance, preventing unexpected re-binding of 'this'.
 */


/**
 * Describes a value that is a reference to a CallScript class or subclass.
 */
export interface CallScriptConstructor {
  new (...args: Array<any>): CallScript;
}


/**
 * Base class for writing call scripts. This class ensures that a "root" method
 * exists (used as the entrypoint for incoming calls) and that all methods are
 * bound to the class instance.
 */
export default class CallScript { // tslint:disable-line no-unnecessary-class
  [index: string]: any;

  constructor() {
    const prototype = Object.getPrototypeOf(this);

    // Get a list of all prototype methods.
    const methods = Object.getOwnPropertyNames(prototype);

    // Bind each method to the instance.
    methods.forEach((methodName: string) => {
      this[methodName] = prototype[methodName].bind(this);
    });
  }
}
