import {Router} from 'express';


/**
 * Can be used in place of 'object' in cases where keys may be added dynamically
 * at runtime, or when the shape of an object is not known.
 */
export interface LooseObject {
  [key: string]: any;
}


/**
 * An "entry" (a la Object.entries or R.toPairs) or any Array of 2 items that
 * represents a relationship.
 *
 * To define a tuple of [string, number]:
 *
 * `interface Foo extends Tuple<string, number> {}`
 */
export interface Tuple<K, V> extends Array<any> {
  [index: number]: any;
  0: K;
  1: V;
}


/**
 * An asynchronous function which accepts any arguments of any type and returns
 * a type `T`.
 *
 * To define a generic async function that returns a number:
 *
 * `type Foo = GenericAsyncFunction<number>;`
 */
export interface GenericAsyncFunction<T> {
  [index: string]: any;
  (...args: Array<any>): Promise<T>;
}


/**
 * A function which accepts any arguments of any type and returns a type `T`.
 *
 * To define a generic function that returns a number:
 *
 * `type Foo = GenericFunction<number>;`
 */
export interface GenericFunction<T> {
  [index: string]: any;
  (...args: Array<any>): T;
}


/**
 * Express router that we can address properties on using Array notation.
 */
export interface IndexableRouter extends Router {
  [index: string]: any;
}


/**
 * Describes the expected shape of a Directive's options object, which should
 * have at least a 'value' key.
 */
export interface DirectiveOptions {
  [key: string]: any;
}


/**
 * Possible types that users can provide for a directive's options:
 *
 * - A literal directive options object.
 * - An async function that returns a directive options object.
 * - A function that returns a directive options object.
 */
export type AbstractDirectiveOptions = DirectiveOptions
  | GenericAsyncFunction<DirectiveOptions>
  | GenericFunction<DirectiveOptions>;


/**
 * Describes a Tuple that represents a directive and its associated options, or
 * a function that should return those options.
 */
export interface DirectiveDescriptor extends Tuple<string, AbstractDirectiveOptions> {}


/**
 * Possible types that can exist as each element in a CallScriptArray:
 *
 * - A literal directive descriptor.
 * - An async function that returns a directive descriptor.
 * - A function that returns a directive descriptor.
 * - A string (that will be pased and validated against the directive descriptor
 *   schema.)
 */
export type CallScriptItem = DirectiveDescriptor
  | GenericAsyncFunction<DirectiveDescriptor>
  | GenericFunction<DirectiveDescriptor>
  | string;


/**
 * Describes the structure of call script arrays, which should contain either
 * DirectiveDescriptor tuples, functions that return DirectiveDescriptor tuples,
 * or strings that can be JSON.parsed into DirectiveDescriptor tuples.
 */
export interface CallScriptArray extends Array<any> {
  [index: number]: CallScriptItem;
}


/**
 * Possible types that users can provide to serve as call scripts:
 *
 * - A literal call script array.
 * - An async function that returns a call script array.
 * - A function that returns a call script array.
 * - A string (that will be parsed and validated against the call script array
 *   schema).
 */
export type AbstractCallScriptArray = CallScriptArray
  | GenericAsyncFunction<CallScriptArray>
  | GenericFunction<CallScriptArray>
  | string;


export interface TwilightConfiguration {
  /**
   * Port to listen on. If not provided, uses process.env.PORT, and then 8080.
   */
  port?: number;

  /**
   * Primary number for forwarding calls when an unknown caller hits the server,
   * and when an error occurs.
   */
  primaryPhoneNumber: string;

  /**
   * Twilio application SID.
   */
  twilioApplicationSid: string;

  /**
   * Twilio Application SID. This is used in production to validate incoming
   * requests and to obtain a valid "From" number for call-forwarding when a
   * Twilio request does not contain one.
   *
   * See: https://www.twilio.com/console
   */
  twilioAccountSid: string;

  /**
   * Twilio auth token.
   *
   * See: https://www.twilio.com/console
   */
  twilioAuthToken: string;

  /**
   * Consumer-provided function that should have a typical Node callback
   * signature. When an incoming request is received, this function will be
   * passed the incoming caller ID and a callback with the signature
   * (error, data).
   *
   * This allows consumers to provide whatever data-store (including plain
   * in-memory objects) they choose.
   */
  callDataFn: Function;

  /**
   * HTTP method that Twilio will use for voice webhooks.
   *
   * See: https://www.twilio.com/docs/api/rest/applications#instance
   */
  voiceMethod?: string;

  /**
   * Route to append to the URL we get from ngrok to construct a complete URL
   * for voice webhooks.
   *
   * See: https://www.twilio.com/docs/api/rest/applications#instance
   */
  voiceUrl?: string;

  /**
   * HTTP method that Twilio will use for status webhooks.
   *
   * See: https://www.twilio.com/docs/api/rest/applications#instance
   */
  statusMethod?: string;

  /**
   * Route to append to the URL we get from ngrok to construct a complete URL
   * for status webhooks.
   *
   * See: https://www.twilio.com/docs/api/rest/applications#instance
   */
  statusUrl?: string;

  /**
   * Level to log at.
   */
  logLevel?: string;

  /**
   * Whether the request validation middleware should check for the
   * X-Forwarded-Proto header.
   */
  allowInsecure?: boolean;
}
