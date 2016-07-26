'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');
require('sinon-as-promised');
const requireSubvert = require('require-subvert')(__dirname);
const express = require('express');

let ExpressWrapper = require('../../lib/index.js');
const logger = require('cta-logger');

const DEFAULTLOGGER = logger();
const DEFAULTDEPENDENCIES = {
  logger: DEFAULTLOGGER,
};
const DEFAULTCONFIG = require('./index.config.testdata.js');

describe('ExpressWrapper - Start', function() {
  context('when everything ok', function() {
    let restapi;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    before(function() {
      // mock an Express Application
      mockExpressApp = express();
      // mock an HTTP Server
      mockHttpServer = mockExpressApp.listen(DEFAULTCONFIG.port);
      // stub Express App listen() to return the mocked HTTP Server
      sinon.stub(mockExpressApp, 'listen').returns(mockHttpServer);
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'info');

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      restapi = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      restapi.start();
    });

    after(function() {
      requireSubvert.cleanUp();
      DEFAULTDEPENDENCIES.logger.info.restore();
      mockHttpServer.close();
    });

    it('should log a starting message', function() {
      expect(restapi.logger.info.calledWith(
        `Starting Express Application on port ${restapi.port}...`
      )).to.equal(true);
    });

    it('should start the Express App (listen()) on configured port', function() {
      expect(restapi.app.listen.calledWith(restapi.port)).to.equal(true);
    });

    it('should set the returned http.Server from Express App as \'server\' property', function() {
      expect(restapi.server).to.equal(mockHttpServer);
    });

    it('should log a success message', function() {
      expect(restapi.logger.info.calledWith(
        `Express Application started successfully on port ${restapi.port}.`
      )).to.equal(true);
    });
  });

  context('when Express App has already been started', function() {
    let restapi;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    before(function() {
      // mock an Express Application
      mockExpressApp = express();
      // mock an HTTP Server
      mockHttpServer = mockExpressApp.listen(DEFAULTCONFIG.port);
      // stub Express App listen() to return the mocked HTTP Server
      sinon.stub(mockExpressApp, 'listen').returns(mockHttpServer);
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'info');

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      restapi = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      restapi.start();

      // try to start again
      restapi.start();
    });

    after(function() {
      requireSubvert.cleanUp();
      DEFAULTDEPENDENCIES.logger.info.restore();
      mockHttpServer.close();
    });

    it('should not try to start the Express App (listen()) on configured port', function() {
      expect(restapi.app.listen.calledTwice).to.equal(false);
    });

    it('should log a already-started message', function() {
      expect(restapi.logger.info.calledWith(
        `Express Application on port ${restapi.port} has been already started.`
      )).to.equal(true);
    });
  });

  context('when Express App fails to start', function() {
    let restapi;
    let stubExpress;
    let mockExpressApp;
    const mockExpressAppListenError = new Error('mock listen error');
    let expectedError;
    before(function(done) {
      // mock an Express Application
      mockExpressApp = express();
      // stub Express App listen() to throw an Error
      sinon.stub(mockExpressApp, 'listen').throws(mockExpressAppListenError);
      // stub NodeJS Express module to return the mocked Express App
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // spy logger
      sinon.spy(DEFAULTDEPENDENCIES.logger, 'error');

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      restapi = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);

      // start
      try {
        restapi.start();
        done(new Error('start should have crashed.'));
      } catch (error) {
        expectedError = error;
        done();
      }
    });

    after(function() {
      requireSubvert.cleanUp();
      DEFAULTDEPENDENCIES.logger.error.restore();
    });

    it('should log an error message', function() {
      return expect(restapi.logger.error.calledWith(
        `Error when starting Express Application on port ${restapi.port}: ${mockExpressAppListenError.message}`
      )).to.equal(true);
    });

    it('should throw an Error', function() {
      return expect(expectedError).to.equal(mockExpressAppListenError);
    });
  });
});
