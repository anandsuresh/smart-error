/**
 * @file Unit tests for the smart error
 *
 * @author Anand Suresh <anandsuresh@gmail.com>
 * @copyright Copyright (C) 2018-present Anand Suresh. All rights reserved.
 */

const {expect} = require('chai')
const {create} = require('..')

describe('SmartError', function () {
  describe('create', function () {
    const ERRORS = {
      Unexpected: 'An unexpected error has occurred.',
      TimedOut: 'The operation timed out.'
    }
    let MyError = null

    beforeEach(function () {
      MyError = create('MyError', ERRORS)
    })

    it('should be callable', function () {
      expect(create).to.be.a('function')
    })

    it('should throw when called without required arguments', function () {
      expect(() => create()).to.throw()
      expect(() => create(null)).to.throw()
      expect(() => create('MyError')).to.throw()
      expect(() => create(42)).to.throw()
      expect(() => create({})).to.throw()
      expect(() => create([])).to.throw()
      expect(() => create(null, null)).to.throw()
    })

    it('should attach static helpers for each error code', function () {
      Object.keys(ERRORS).forEach(k => expect(MyError[k]).to.be.a('function'))
    })

    it('should return an instance of MyError for each static helper', function () {
      const isMyError = k => expect(MyError[k]()).to.be.an.instanceof(MyError)
      Object.keys(ERRORS).forEach(isMyError)
    })

    it('instances of MyError should have expected helpers', function () {
      Object.keys(ERRORS).forEach(key => {
        const err = MyError[key]('foo')

        expect(err.code).to.equal(key)
        expect(err.metadata).to.equal('foo')

        expect(err).to.have.property(`is${key}`)
        expect(err[`is${key}`]).to.be.true // eslint-disable-line no-unused-expressions
      })
    })
  })
})
