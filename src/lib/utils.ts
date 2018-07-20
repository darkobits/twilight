import R from 'ramda';

import {LooseObject} from 'etc/types';


/**
 * Asserts that the "expected" XML fragment is contained in the received XML
 * response from supertest.
 */
export const assertXmlContains: Function = R.curry((expected: string, response: string) => {
  // Normalize both XML chunks by removing whitespace.
  expect(response.replace(/[\s]/g, '')).toMatch(expected.replace(/[\s]/g, ''));
});


/**
 * Returns true if the provided value is a valid phone number in E.164 format.
 */
export function isValidPhoneNumber(phoneNumber?: string): boolean {
  if (phoneNumber) {
    return /^\+?[1-9]\d{1,14}$/g.test(phoneNumber);
  }

  return false;
}


/**
 * Accepts an object and returns a new object with all 'undefined' keys removed.
 */
export const removeUndefinedKeys = (obj: LooseObject = {}): LooseObject => R.filter(R.complement(R.equals(undefined)), obj);
