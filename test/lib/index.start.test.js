'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');
require('sinon-as-promised');
const requireSubvert = require('require-subvert')(__dirname);
const express = require('express');
const http = require('http');

let ExpressWrapper = require('../../lib/index.js');
const logger = require('cta-logger');

const DEFAULTLOGGER = logger();
const DEFAULTDEPENDENCIES = {
  logger: DEFAULTLOGGER,
};
const DEFAULTCONFIG = require('./index.config.testdata.js');

describe('ExpressWrapper - Start', function() {
  context('when everything ok', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    before(function(done) {
      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'info');

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp).on('listening', function() {
        done();
      });
      sinon.spy(mockHttpServer, 'listen');
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // mock an Express Application
      mockExpressApp = express();
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      expresswrapper.start();
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
      DEFAULTDEPENDENCIES.logger.info.restore();
      mockHttpServer.close();
    });

    it('should log a starting message', function() {
      expect(expresswrapper.logger.info.calledWith(
        `Starting Express Application on port ${expresswrapper.port}...`
      )).to.equal(true);
    });

    it('should start the Express App (listen()) on configured port', function() {
      expect(expresswrapper.server.listen.calledWith(expresswrapper.port)).to.equal(true);
    });

    it('should set isServerStarting property to true', function() {
      expect(expresswrapper.isServerStarting).to.equal(true);
    });

    it('should log a success message', function() {
      expect(expresswrapper.logger.info.calledWith(
        `Express Application started successfully on port ${expresswrapper.port}.`
      )).to.equal(true);
    });
  });

  context('when Express App has already been started', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    before(function(done) {
      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'info');

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp).on('listening', function() {
        done();
      });
      sinon.spy(mockHttpServer, 'listen');
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // mock an Express Application
      mockExpressApp = express();
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      expresswrapper.start();
      expresswrapper.start();
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
      DEFAULTDEPENDENCIES.logger.info.restore();
      mockHttpServer.close();
    });

    it('should not try to start the HTTP Server (listen()) on configured port', function() {
      expect(expresswrapper.server.listen.calledTwice).to.equal(false);
    });

    it('should log a already-started message', function() {
      expect(expresswrapper.logger.info.calledWith(
        `Express Application on port ${expresswrapper.port} has been already started.`
      )).to.equal(true);
    });
  });

  context('when HTTP Server emits an Error', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    const mockError = new Error('mock http server error');
    let expectedError;
    before(function(done) {
      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'error');

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp);
      sinon.spy(mockHttpServer, 'listen');

      sinon.stub(http, 'createServer').returns(mockHttpServer);
      // mock an Express Application
      mockExpressApp = express();
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      expresswrapper.start();
      const errorCallback = mockHttpServer.listeners('error')[0];
      mockHttpServer.removeListener('error', errorCallback);
      mockHttpServer.on('error', function(error) {
        try {
          errorCallback(error);
        } catch (finalError) {
          expectedError = finalError;
          done();
        }
      });

      // simulate error
      mockHttpServer.emit('error', mockError);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
      DEFAULTDEPENDENCIES.logger.error.restore();
      mockHttpServer.close();
    });

    it('should log a warning message', function() {
      return expect(expresswrapper.logger.error.calledWith(
        `Error emitted by Express Application on port ${expresswrapper.port}: ${expectedError.message}`
      )).to.equal(true);
    });

    it('should throw an Error', function() {
      return expect(expectedError).to.equal(mockError);
    });
  });

  context('when HTTP Server fails to start (e.g. listen)', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    const mockHttpServerListenError = new Error('mock listen error');
    let expectedError;
    before(function() {
      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'error');

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp);
      sinon.stub(mockHttpServer, 'listen').throws(mockHttpServerListenError);
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // mock an Express Application
      mockExpressApp = express();
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
      DEFAULTDEPENDENCIES.logger.error.restore();
    });

    it('should throw an Error', function() {
      expect(function() {
        expresswrapper.start();
      }).throw(Error, expectedError);
      expect(expresswrapper.logger.error.calledWith(
          `Error when starting Express Application on port ${expresswrapper.port}: ${mockHttpServerListenError.message}`
        )).to.equal(true);
    });
  });
});
