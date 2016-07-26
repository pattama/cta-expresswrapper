'use strict';
const express = require('express');

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
    // todo: validate configuration properties
    this.configuration = configuration;
    this.port = configuration.port;

    this.dependencies = dependencies;
    this.logger = dependencies.logger;

    this.app = express();
    this.server = null;
  }

  /**
   * Starts the Express Application using configured port
   */
  start() {
    this.logger.info(`Starting Express Application on port ${this.port}...`);
    if (this.server === null) {
      try {
        this.server = this.app.listen(this.port);
      } catch (error) {
        this.logger.error(`Error when starting Express Application on port ${this.port}: ${error.message}`);
        throw error;
      }
      this.logger.info(`Express Application started successfully on port ${this.port}.`);
    } else {
      this.logger.info(`Express Application on port ${this.port} has been already started.`);
    }
  }

}

module.exports = ExpressWrapper;
