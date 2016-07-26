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
const methods = require('methods');

let ExpressWrapper = require('../../lib/index.js');
const logger = require('cta-logger');

const DEFAULTLOGGER = logger();
const DEFAULTDEPENDENCIES = {
  logger: DEFAULTLOGGER,
};
const DEFAULTCONFIG = require('./index.config.testdata.js');

describe('ExpressWrapper - Constructor', function() {
  context('when everything ok', function() {
    let restapi;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    before(function() {
      // stub NodeJS Express module; returns a mocked Express App
      // mock an Express Application by stubbing all its HTTP methods
      mockExpressApp = express();
      methods.forEach(function(method) {
        mockExpressApp[method] = sinon.stub();
      });
      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp);
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      restapi = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
    });

    it('should return a new ExpressWrapper object', function() {
      expect(restapi).to.be.an.instanceof(ExpressWrapper);
    });

    it('should have the configuration as a \'configuration\' property', function() {
      expect(restapi).to.have.property('configuration', DEFAULTCONFIG);
    });

    it('should have configuration.port as a \'port\' Number property', function() {
      expect(restapi).to.have.property('port', DEFAULTCONFIG.port);
    });

    it('should have the dependencies as a \'dependencies\' property', function() {
      expect(restapi).to.have.property('dependencies', DEFAULTDEPENDENCIES);
    });

    it('should have a logger instance set as a \'logger\' property', function() {
      expect(restapi).to.have.property('logger', DEFAULTDEPENDENCIES.logger);
    });

    it('should have an Express application instance as \'app\' property', function() {
      expect(restapi).to.have.property('app', mockExpressApp);
    });

    it('should have an HTTP Server as \'server\' property', function() {
      expect(restapi).to.have.property('server', mockHttpServer);
    });

    it('should have a Boolean false as \'isServerStarting\' property', function() {
      expect(restapi).to.have.property('isServerStarting', false);
    });

    it('for each HTTP methods in nodejs module \'methods\', it should have a method of the same name', function() {
      methods.forEach(function(method) {
        expect(restapi).to.have.property(method).and.to.be.a('function');
        restapi[method]();
        expect(mockExpressApp[method].called).to.equal(true);
      });
    });
  });
});
