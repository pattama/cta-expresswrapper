'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const MockExpressRequest = require('mock-express-request');
const MockExpressResponse = require('mock-express-response');
const sinon = require('sinon');
require('sinon-as-promised');

const ExpressWrapper = require('../../lib/index.js');
const logger = require('cta-logger');

const DEFAULTLOGGER = logger();

describe('ExpressWrapper - _onRequestAndResponseMiddleware', function() {
  const middleware = ExpressWrapper.prototype
    ._onRequestAndResponseMiddleware.bind({
      logger: DEFAULTLOGGER,
    });
  context('when response finishes', function() {
    const req = new MockExpressRequest({
      method: 'GET',
      url: '/foo/bar',
    });
    const res = new MockExpressResponse({
      request: req,
    });
    const next = sinon.stub();
    before(function() {
      sinon.spy(DEFAULTLOGGER, 'info');
      middleware(req, res, next);
    });
    after(function() {
      DEFAULTLOGGER.info.restore();
    });

    it('should log a request received message', function() {
      sinon.assert.calledWith(DEFAULTLOGGER.info,
        `${req.method} ${req.url} received`);
    });

    it('should log a response done message', function(done) {
      res.status(200).send({ok: 1});
      res.on('finish', function() {
        sinon.assert.calledWith(DEFAULTLOGGER.info,
          `${req.method} ${req.url} done ${this.statusCode} ${this.statusMessage}`);
        done();
      });
    });

    it('should call next()', function() {
      sinon.assert.called(next);
    });
  });

  context('when response errors', function() {
    const req = new MockExpressRequest({
      method: 'GET',
      url: '/foo/bar',
    });
    const res = new MockExpressResponse({
      request: req,
    });
    const next = sinon.stub();
    before(function() {
      sinon.spy(DEFAULTLOGGER, 'info');
      middleware(req, res, next);
    });
    after(function() {
      DEFAULTLOGGER.info.restore();
    });

    it('should log a request received message', function() {
      sinon.assert.calledWith(DEFAULTLOGGER.info,
        `${req.method} ${req.url} received`);
    });

    it.skip('should log a error message', function(done) {
      const mockError = new Error('mock error');
      res.emit('error', mockError);
      res.on('error', function() {
        sinon.assert.calledWith(DEFAULTLOGGER.info,
          `${req.method} ${req.url} error ${mockError.message}`);
        done();
      });
    });

    it('should call next()', function() {
      sinon.assert.called(next);
    });
  });
});
