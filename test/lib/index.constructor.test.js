'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');
require('sinon-as-promised');
const mockrequire = require('mock-require');
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
    const reqCallback = ExpressWrapper.prototype
      ._onRequestAndResponseMiddleware.bind(expresswrapper);
    before(function() {
      // stub NodeJS Express module; returns a mocked Express App
      // mock an Express Application by stubbing all its HTTP methods
      mockExpressApp = express();
      sinon.spy(mockExpressApp, 'use');
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
      sinon.stub(ExpressWrapper.prototype._onRequestAndResponseMiddleware, 'bind').returns(reqCallback);
      expresswrapper = new ExpressWrapper(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
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
      expect(expresswrapper).to.have.property('port', DEFAULTCONFIG.properties.port);
    });

    it('should have the dependencies as a \'dependencies\' property', function() {
      expect(expresswrapper).to.have.property('dependencies', DEFAULTDEPENDENCIES);
    });

    // it('should have a logger instance set as a \'logger\' property', function() {
    //   expect(expresswrapper).to.have.property('logger', DEFAULTDEPENDENCIES.logger);
    // });

    it('should have an Express application instance as \'app\' property', function() {
      expect(expresswrapper).to.have.property('app', mockExpressApp);
    });

    it('should use _onRequestAndResponseMiddleware method on \'app\' instance', function() {
      sinon.assert.calledWith(mockExpressApp.use, reqCallback);
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

  context('when everything ok and logger instance exists in dependencies', function() {
    let tool;
    let mockLoggerAuthorResult;
    before(function() {
      mockLoggerAuthorResult = {
        info: sinon.stub(),
      };
      sinon.stub(DEFAULTDEPENDENCIES.logger, 'author').withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult);
      tool = new ExpressWrapper(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
    });
    after(function() {
      DEFAULTDEPENDENCIES.logger.author.restore();
    });
    it('should set instance returned by dependencies.logger.author() method as a property of the Tool instance', function() {
      expect(tool).to.have.property('logger', mockLoggerAuthorResult);
    });
    it('should log a logger initialized message', function() {
      sinon.assert.calledWith(mockLoggerAuthorResult.info, `Initialized logger for Tool ${tool.name}`);
    });
  });

  context('when everything ok and logger instance does not exist in dependencies', function() {
    let tool;
    const dependencies = _.cloneDeep(DEFAULTDEPENDENCIES);
    delete dependencies.logger;
    let MockLoggerConstructor;
    let mockLogger;
    let mockLoggerAuthorResult;
    before(function() {
      mockLoggerAuthorResult = {
        info: sinon.stub(),
      };
      mockLogger = {
        author: sinon.stub().withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult),
      };
      MockLoggerConstructor = sinon.stub().returns(mockLogger);
      mockrequire('cta-logger', MockLoggerConstructor);
      tool = new ExpressWrapper(dependencies, DEFAULTCONFIG);
    });
    after(function() {
    });
    it('should create a new Logger', function() {
      sinon.assert.called(MockLoggerConstructor);
    });
    it('should set instance returned by new logger.author() method as a property of the Tool instance', function() {
      expect(tool).to.have.property('logger', mockLoggerAuthorResult);
    });
    it('should log a logger initialized message', function() {
      sinon.assert.calledWith(mockLoggerAuthorResult.info, `Initialized logger for Tool ${tool.name}`);
    });
  });

  context('when everything ok and singleton is true', function() {
    let singleton;
    let config;
    before(function() {
      config = _.cloneDeep(DEFAULTCONFIG);
      config.singleton = true;
      singleton = new ExpressWrapper(DEFAULTDEPENDENCIES, config);
    });
    after(function() {
    });
    it('should return the instantiated and registered singleton', function() {
      const tool = new ExpressWrapper(DEFAULTDEPENDENCIES, config);
      expect(tool).to.equal(singleton);
    });
  });

  context('when missing/incorrect \'port\' property in configuration.properties', function() {
    const config = _.cloneDeep(DEFAULTCONFIG);
    it('should throw an Error', function() {
      delete config.properties.port;
      return expect(function() {
        return new ExpressWrapper(DEFAULTDEPENDENCIES, config);
      }).to.throw(Error, 'missing/incorrect \'port\' number property in configuration');
    });
  });
});
