'use strict';
const express = require('express');
const http = require('http');
const methods = require('methods');

/**
 * ExpressWrapper class
 * @property {Object} configuration - module own configuration
 * @property {Number} port - the port on which to start the Express Application
 * @property {Object} [dependencies] - tool's dependencies injected by Cement according to tool's configuration
 * @property {Express} app - instance of an Express Application
 * @property {Http.Server} server - instance of a HTTP Server
 */
class ExpressWrapper {
  /**
   * ExpressWrapper constructor
   * @param {Object} configuration - module own configuration
   * @param {Object} [dependencies] - tool's dependencies injected by Cement according to tool's configuration
   * @example
   * See how Cement instantiate tools
   */
  constructor(configuration, dependencies) {
    const that = this;

    // todo: validate configuration properties
    this.configuration = configuration;
    this.port = configuration.port;

    this.dependencies = dependencies;
    this.logger = dependencies.logger;

    // creates unstarted Express App and HTTP Server
    this.app = express();
    this.server = http.createServer(this.app);
    this.isServerStarting = false;

    // wraps all Express App HTTP methods
    methods.forEach(function(method) {
      that[method] = function(path, callback) {
        // todo: validation, checking if route does not exist already, etc...
        that.app[method](path, callback);
      };
    });
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
