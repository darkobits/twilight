/**
 * ===== AJV Configuration =====================================================
 *
 * This file provides a central place for AJV (re: JSON schema validation)
 * config and error-handling.
 *
 * Schemas used throughout Twilight may have a custom "$meta" key, which is
 * implemented here and used to format error messages.
 */
import Ajv from 'ajv';
// @ts-ignore
import AjvKeywords from 'ajv-keywords';
// @ts-ignore
import AjvErrors from 'ajv-errors';
import {merge} from 'ramda';

import {LooseObject} from 'etc/types';


// Create and configure a new AJV instance.
const ajv = new Ajv({allErrors: true, jsonPointers: true});

// Install ajv-keywords.
AjvKeywords(ajv, ['typeof']);

// Install ajv-errors.
AjvErrors(ajv);


/**
 * Cache of pre-compiled schema validation functions.
 */
const schemaCache: Map<object, Ajv.ValidateFunction> = new Map();


/**
 * Provided an errors array from an AJV validation function, returns a string
 * describing each error that occurred.
 */
function parseAjvErrors(errors: Array<Ajv.ErrorObject>): string {
  return errors.map((error, index) => {
    return `    ${index + 1}. Value at ${error.dataPath || '"root"'} ${error.message}.`;
  }).join('\n');
}


/**
 * Provided a schema and a value, validates the value against the schema and
 * returns it.
 */
export function validate<T>(schema: LooseObject, value: T, beLoud?: any): T {
  const meta = merge({domain: null, label: 'value'}, schema.$meta);

  if (!schemaCache.has(schema)) {
    schemaCache.set(schema, ajv.compile(schema));
  }

  const validationFn = schemaCache.get(schema) as Ajv.ValidateFunction;

  try {
    validationFn(value);

    if (beLoud) {
      console.log('ERRORS ARE:', validationFn.errors);
    }

    // AJV doesnt throw on errors. Instead, it attaches an "errors" array to the
    // validation function.
    if (Array.isArray(validationFn.errors) && validationFn.errors.length > 0) {
      throw new Error([
        `${meta.domain ? `[${meta.domain}] ` : ''}Invalid ${meta.label}:`,
        parseAjvErrors(validationFn.errors)
      ].join('\n'));
    }

    return value;
  } finally {
    // Because it is cached, we must clear the errors array on the validation
    // function so that subsequent validations may succeed.
    Reflect.deleteProperty(validationFn, 'errors');
  }
}


export default ajv;
