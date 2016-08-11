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

describe('ExpressWrapper - _wrap and http methods', function() {
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
      expresswrapper = new ExpressWrapper(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
    });

    methods.forEach(function(method) {
      describe(`calling method ${method}`, function() {
        const mockPath = '/mock';
        const mockHandler = sinon.stub();
        before(function() {
          sinon.spy(expresswrapper.logger, 'debug');
          expresswrapper[method](mockPath, mockHandler);
        });
        after(function() {
          expresswrapper.logger.debug.restore();
        });

        it(`should call Express App ${method} (e.g. set a route)`, function() {
          expect(expresswrapper.app[method].calledWith(mockPath, mockHandler)).to.equal(true);
        });

        it(`should log a debug message`, function() {
          sinon.assert.calledWith(expresswrapper.logger.debug,
            `Route ${method.toUpperCase()} ${mockPath} bound successfully.`);
        });

        it(`add route info (method, path, callback) to routes Map`, function() {
          expect(expresswrapper.routes.has(method)).to.equal(true);
          expect(expresswrapper.routes.get(method).has(mockPath)).to.equal(true);
          expect(expresswrapper.routes.get(method).get(mockPath)).to.equal(mockHandler);
        });
      });
    });

    describe(`calling method get again for code coverage`, function() {
      const method = 'get';
      const mockPath = '/mockagain';
      const mockHandler = sinon.stub();
      before(function() {
        expresswrapper[method](mockPath, mockHandler);
      });

      it(`should call Express App ${method} (e.g. set a route)`, function() {
        expect(expresswrapper.app[method].calledWith(mockPath, mockHandler)).to.equal(true);
      });

      it(`add route info (method, path, callback) to routes Map`, function() {
        expect(expresswrapper.routes.has(method)).to.equal(true);
        expect(expresswrapper.routes.get(method).has(mockPath)).to.equal(true);
        expect(expresswrapper.routes.get(method).get(mockPath)).to.equal(mockHandler);
      });
    });
  });

  context('when route is already defined (example with GET)', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    const mockMethod = 'get';
    const mockPath = '/mock';
    const mockHandler = sinon.stub();
    before(function() {
      // stub NodeJS Express module; returns a mocked Express App
      // mock an Express Application by stubbing all its HTTP methods
      mockExpressApp = express();

      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp);
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTDEPENDENCIES, DEFAULTCONFIG);

      // define the GET /mock route a first time
      expresswrapper[mockMethod](mockPath, mockHandler);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
    });

    it('should throw an Error', function() {
      expect(function() {
        expresswrapper[mockMethod](mockPath, mockHandler); // try to define it a second time
      }).to.throw(Error, `Route ${mockMethod.toUpperCase()} ${mockPath} has already been defined.`);
    });
  });

  context('when express route method fails (example with GET)', function() {
    let expresswrapper;
    let stubExpress;
    let mockExpressApp;
    let mockHttpServer;
    const mockMethod = 'get';
    const mockPath = '/mock';
    const mockHandler = sinon.stub();
    const mockExpressAppMethodError = new Error('mock error');
    before(function() {
      // stub NodeJS Express module; returns a mocked Express App
      // mock an Express Application by stubbing all its HTTP methods
      mockExpressApp = express();
      sinon.stub(mockExpressApp, mockMethod).withArgs(mockPath).throws(mockExpressAppMethodError);

      stubExpress = sinon.stub().returns(mockExpressApp);
      requireSubvert.subvert('express', stubExpress);

      // stub NodeJS Http module createServer method; returns a mocked Http Server
      mockHttpServer = http.createServer(mockExpressApp);
      sinon.stub(http, 'createServer').returns(mockHttpServer);

      // reload ExpressWrapper class with stubbed Express
      ExpressWrapper = requireSubvert.require('../../lib/index.js');
      expresswrapper = new ExpressWrapper(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
    });

    after(function() {
      requireSubvert.cleanUp();
      http.createServer.restore();
    });

    it('should throw an Error', function() {
      expect(function() {
        expresswrapper[mockMethod](mockPath, mockHandler); // try to define it a second time
      }).to.throw(mockExpressAppMethodError);
    });
  });
});
