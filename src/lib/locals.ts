/**
 * ===== Locals ================================================================
 *
 * In-memory container for application-wide objects, like user-provided
 * configuration and Twilio clients.
 */
import dotProp from 'dot-prop';


class TwilightLocals {
  private readonly _locals = {};

  /**
   * Returns the value at the provided path. If the value does not exist, an
   * error is thrown.
   */
  get(path: string) {
    const value = dotProp.get(this._locals, path);

    if (value === undefined) {
      throw new Error(`[TwilightLocals] Property "${path}" does not exist.`);
    }

    return value;
  }


  /**
   * Sets the value at the provided path.
   */
  set(path: string, value: any) {
    dotProp.set(this._locals, path, value);
  }
}


export default new TwilightLocals();
