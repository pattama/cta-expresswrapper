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
const _ = require('lodash');

let ExpressWrapper = require('../../lib/index.js');
const logger = require('cta-logger');

const DEFAULTLOGGER = logger();
const DEFAULTDEPENDENCIES = {
  logger: DEFAULTLOGGER,
};
const DEFAULTCONFIG = require('./index.config.testdata.js');

describe('ExpressWrapper - Constructor', function() {
  context('when everything ok', function() {
    let expresswrapper;
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
      sinon.spy(ExpressWrapper.prototype, '_wrap');
      expresswrapper = new ExpressWrapper(DEFAULTCONFIG, DEFAULTDEPENDENCIES);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
    });

    it('should return a new ExpressWrapper object', function() {
      expect(expresswrapper).to.be.an.instanceof(ExpressWrapper);
    });

    it('should have the configuration as a \'configuration\' property', function() {
      expect(expresswrapper).to.have.property('configuration', DEFAULTCONFIG);
    });

    it('should have configuration.port as a \'port\' Number property', function() {
      expect(expresswrapper).to.have.property('port', DEFAULTCONFIG.port);
    });

    it('should have the dependencies as a \'dependencies\' property', function() {
      expect(expresswrapper).to.have.property('dependencies', DEFAULTDEPENDENCIES);
    });

    it('should have a logger instance set as a \'logger\' property', function() {
      expect(expresswrapper).to.have.property('logger', DEFAULTDEPENDENCIES.logger);
    });

    it('should have an Express application instance as \'app\' property', function() {
      expect(expresswrapper).to.have.property('app', mockExpressApp);
    });

    it('should have an HTTP Server as \'server\' property', function() {
      expect(expresswrapper).to.have.property('server', mockHttpServer);
    });

    it('should have a Routes Map as \'routes\' property', function() {
      expect(expresswrapper).to.have.property('routes').and.to.be.a('Map');
    });

    it('should have a Boolean false as \'isServerStarting\' property', function() {
      expect(expresswrapper).to.have.property('isServerStarting', false);
    });

    it('for each HTTP methods in nodejs module \'methods\', it should have a method of the same name', function() {
      methods.forEach(function(method) {
        expect(expresswrapper._wrap.calledWith(method)).to.equal(true);
        expect(expresswrapper).to.have.property(method).and.to.be.a('function');
        expresswrapper[method]();
        expect(mockExpressApp[method].called).to.equal(true);
      });
    });
  });

  context(`when missing/incorrect 'configuration' argument`, function() {
    it('should throw an Error', function() {
      return expect(function() {
        return new ExpressWrapper(null, DEFAULTDEPENDENCIES);
      }).to.throw(Error, `missing/incorrect 'configuration' object argument`);
    });
  });

  context(`when missing/incorrect 'port' property in configuration`, function() {
    const config = _.cloneDeep(DEFAULTCONFIG);
    it('should throw an Error', function() {
      delete config.port;
      return expect(function() {
        return new ExpressWrapper(config, DEFAULTDEPENDENCIES);
      }).to.throw(Error, `missing/incorrect 'port' number property in configuration`);
    });
  });

  context(`when missing/incorrect 'dependencies' argument`, function() {
    it('should throw an Error', function() {
      return expect(function() {
        return new ExpressWrapper(DEFAULTCONFIG, null);
      }).to.throw(Error, `missing/incorrect 'dependencies' object argument`);
    });
  });

  context(`when missing/incorrect 'logger' tool in dependencies`, function() {
    const dependencies = _.cloneDeep(DEFAULTDEPENDENCIES);
    it('should throw an Error', function() {
      delete dependencies.logger;
      return expect(function() {
        return new ExpressWrapper(DEFAULTCONFIG, dependencies);
      }).to.throw(Error, `missing/incorrect 'logger' tool in dependencies`);
    });
  });
});
