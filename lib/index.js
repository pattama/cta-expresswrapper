'use strict';
const express = require('express');
const http = require('http');
const methods = require('methods');
const Tool = require('cta-tool');

/**
 * ExpressWrapper class
 * @property {Object} configuration - module own configuration
 * @property {Number} port - the port on which to start the Express Application
 * @property {Object} dependencies - tool's dependencies injected by Cement according to tool's configuration
 * @property {Logger} logger - instance of cta-logger
 * @property {Express} app - instance of an Express Application
 * @property {Http.Server} server - instance of a HTTP Server
 * @property {Boolean} isServerStarting - whether the HTTP Server has began starting or not
 * @property {Map<method, Map<path, handler>>} routes - A Map of Maps of all the routes that have been applied in the Express App
 *
 */
class ExpressWrapper extends Tool {
  /**
   * ExpressWrapper constructor
   * @param {Object} dependencies - tool's dependencies injected by Cement according to tool's configuration
   * @param {Object} configuration - Tool configuration from Cement
   * @param {Number} configuration.properties.port - the port on which to start the Express Application
   * @example
   * See how Cement instantiate tools
   */
  constructor(dependencies, configuration) {
    // do not modify the 4 following lines
    const instance = super(dependencies, configuration);
    if (instance.singleton && instance.fullyInitialized) {
      return instance;
    }

    /* begin definition */
    const that = this;
    if (!this.properties.hasOwnProperty('port') || typeof this.properties.port !== 'number') {
      throw (new Error(`missing/incorrect 'port' number property in configuration`));
    }
    this.port = this.properties.port;

    // creates unstarted Express App and HTTP Server
    this.app = express();
    this.server = http.createServer(this.app);
    this.isServerStarting = false;
    this.routes = new Map();

    // wraps all Express App HTTP methods
    methods.forEach(function(method) {
      that._wrap(method);
    });
    /* end definition */

    // do not modify the following lines
    this.logger.info(`Instantiated Tool ${this.name} successfully.`);
    this.fullyInitialized = true;
  }

  /**
   * Wraps all Express App methods and set them as methods of this Tool
   * @param {String} method - name of an HTTP method
   * @private
   */
  _wrap(method) {
    const that = this;
    that[method] = function(path, callback) {
      if (!that.routes.has(method)) {
        that.routes.set(method, new Map());
      }
      if (that.routes.get(method).has(path)) {
        throw new Error(`Route ${method.toUpperCase()} ${path} has already been defined.`);
      } else {
        try {
          that.app[method](path, callback);
        } catch (error) {
          throw error;
        }
        that.routes.get(method).set(path, callback);
      }
    };
  }

  /**
   * Starts the HTTP Server using configured port
   */
  start() {
    const that = this;
    that.logger.info(`Starting Express Application on port ${that.port}...`);
    if (that.isServerStarting) {
      that.logger.info(`Express Application on port ${that.port} has been already started.`);
    } else {
      try {
        that.isServerStarting = true;
        that.server.listen(that.port)
          .on('listening', function() {
            that.logger.info(`Express Application started successfully on port ${that.port}.`);
          })
          .on('error', function(error) {
            that.logger.error(`Error emitted by Express Application on port ${that.port}: ${error.message}`);
            throw error;
          });
      } catch (error) {
        that.logger.error(`Error when starting Express Application on port ${that.port}: ${error.message}`);
        throw error;
      }
    }
  }

}

module.exports = ExpressWrapper;
