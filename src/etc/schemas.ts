/**
 * JSON Schema analogue for the DirectiveDescriptor interface used to validate
 * user input at runtime.
 */
export const DIRECTIVE_DESCRIPTOR_SCHEMA = {
  $meta: {
    domain: 'DirectiveDescriptor',
    label: 'directive descriptor'
  },
  type: 'array',
  minItems: 2,
  maxItems: 2,
  items: [
    {type: 'string'},
    {oneOf: [
      {type: 'object'},
      {typeof: 'function'}
    ]}
  ],
  errorMessage: {
    items: [
      'should be a string',
      'should be an object or a function'
    ]
  }
};


/**
 * JSON Schema analogue of the CallScriptArray interface used to validate user
 * input at runtime.
 */
export const CALL_SCRIPT_ARRAY_SCHEMA = {
  $meta: {
    domain: 'CallScriptArray',
    label: 'call script'
  },
  type: 'array',
  items: {
    oneOf: [
      DIRECTIVE_DESCRIPTOR_SCHEMA,
      {typeof: 'function'},
      {type: 'string'}
    ]
  }
};


/**
 * JSON Schema for Twilight configuration.
 */

const $httpMethodSchema = {
  type: 'string',
  enum: ['GET', 'PUT', 'POST', 'DELETE']
};

const $routeSchema = {
  oneOf: [{
    type: 'string',
    pattern: '^(\\/[\\d\\w-]+)+\\/?$'
  }, {
    type: 'null'
  }]
};


export const CONFIG_SCHEMA = {
  type: 'object',
  properties: {
    twilioAccountSid: {
      type: 'string',
      pattern: '^AC[0-9a-zA-Z]+$'
    },
    twilioApplicationSid: {
      anyOf: [{
        type: 'string',
        pattern: '^AP[0-9a-zA-Z]+$'
      }, {
        type: 'string',
        value: ''
      }]
    },
    twilioAuthToken: {
      type: 'string',
      pattern: '^[0-9a-zA-Z]+$'
    },
    voiceMethod: $httpMethodSchema,
    voiceUrl: $routeSchema,
    statusMethod: $httpMethodSchema,
    statusUrl: $routeSchema,
    logLevel: {
      type: 'string',
      enum: [
        'silent',
        'silly',
        'debug',
        'verbose',
        'info',
        'warn',
        'error'
      ]
    },
    allowInsecure: {
      type: 'boolean'
    },
    callDataFn: {
      typeof: 'function'
    }
  },
  required: [
    'twilioAccountSid',
    'twilioApplicationSid',
    'twilioAuthToken',
    'voiceUrl',
    'statusUrl',
    'allowInsecure',
    'callDataFn'
  ]
};
