/**
 * @file An implementation of a smart error
 *
 * @author Anand Suresh <anandsuresh@gmail.com>
 * @copyright Copyright (C) 2018-present Anand Suresh. All rights reserved.
 */

const {inherits} = require('util')

/**
 * Performs type-checks and throw a TypeError on failure
 *
 * @param {String} name The name of the field
 * @param {*} value The value being checked
 * @param {String} type The expected type of the value
 */
function assert (name, value, type) {
  const typeOfValue = typeof value
  if (typeOfValue !== type) {
    const msg = `${name}: expected ${type}; got ${typeOfValue}: "${value}"`
    throw new TypeError(msg)
  }
}

/**
 * Creates a SmartError sub-class
 *
 * @param {String} name The name of the error
 * @param {Object} errors A map of error-codes to error-messages
 * @returns {SmartError}
 */
function create (name, errors) {
  assert('name', name, 'string')
  assert('errors', errors, 'object')

  /**
   * A class that extends the JavaScript Error class
   *
   * @param {String} code A unique error code
   * @param {*} [metadata] Optional metadata for the error
   * @param {Error} [cause] Optional error that was originally thrown
   */
  function SmartError (code, metadata, cause, stackFrame = SmartError) {
    if (metadata instanceof Error) {
      cause = metadata
      metadata = undefined
    }

    SmartError.super_.call(this)

    Object.defineProperty(this, '_props', {
      writable: false,
      value: {code, metadata, cause}
    })

    Error.captureStackTrace(this._props, stackFrame)
  }
  inherits(SmartError, Error)

  // Instance properties
  Object.defineProperties(SmartError.prototype, {
    name: {
      configurable: false,
      enumerable: true,
      get: function () { return name }
    },
    code: {
      configurable: false,
      enumerable: true,
      get: function () { return this._props.code }
    },
    message: {
      configurable: false,
      enumerable: true,
      get: function () { return errors[this._props.code] }
    },
    metadata: {
      configurable: false,
      enumerable: true,
      get: function () { return this._props.metadata }
    },
    cause: {
      configurable: false,
      enumerable: true,
      get: function () { return this._props.cause }
    },
    stack: {
      configurable: false,
      enumerable: true,
      get: function () { return this._props.stack }
    },
    isSmartError: {
      configurable: false,
      enumerable: true,
      get: function () { return this instanceof SmartError }
    }
  })

  /**
   * Returns the JSON representation of the error
   *
   * @param {String} key The key being serialized
   * @returns {Object}
   */
  SmartError.prototype.toJSON = function (key) {
    const {code, metadata, cause, stack} = this._props
    const result = {name, code}

    if (metadata != null) {
      result.metadata = metadata
    }

    if (cause != null) {
      if (cause.isSmartError) {
        result.cause = cause.toJSON('cause')
      } else if (cause instanceof Error) {
        result.cause = {
          code: cause.code,
          message: cause.message,
          stack: cause.stack
        }
      } else {
        result.cause = cause
      }
    }

    result.stack = stack
    return result
  }

  /**
   * Returns the string version of the error
   * @returns {String}
   */
  SmartError.prototype.toString = function () {
    return `${this.name}: ${this.message}`
  }

  /**
   * Returns the detailed string version of the error
   * @returns {String}
   */
  SmartError.prototype.toDetailedString = function () {
    return this.stack
  }

  // Attach static helper methods and instance helper properties
  Object.keys(errors).forEach(err => {
    SmartError[err] = function (metadata, cause) {
      return new SmartError(err, metadata, cause, SmartError[err])
    }

    Object.defineProperty(SmartError.prototype, `is${err}`, {
      configurable: false,
      enumerable: false,
      get: function () { return (this._props.code === err) }
    })
  })

  return SmartError
}

/**
 * Export the interface
 * @type {Object}
 */
module.exports = {create}
