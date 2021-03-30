/**
 * @file Winston transport for Neo4j
 * @license ISC
 * @author Glen Holmes <me@glenholmes.me>
 */

import Neode from 'neode';
import moment from 'moment';
import { Transport } from 'winston';

class Neo4jTransport extends Transport {
  /**
   * Constructor for the neo4j transport object.
   * @constructor
   * @param {Object} options
   * @param {string} options.url - Neo4j uri 'bolt://localhost:7687'
   * @param {string} options.username - Neo4j username
   * @param {string} options.password - Neo4j password
   * @param {string} [options.level=info] - Level of messages that this transport should log
   * @param {string} [options.nodeLabel=Log] - The Neo4j node label for logs
   * @param {boolean} [options.silent=false] - Boolean flag indicating whether to suppress output
   */
  constructor(options = {}) {
    super();
    this.name = 'Neo4jTransport';
    // Check required options   
    if (!options.url || !options.username || !options.password) {
      throw new Error('You have to define Noe4j url, username and password!');
    }
    // Set Neode Instanse
    this.instance = new Neode(options.url, options.username, options.password);

    // Set defaults
    this.level = options.level || 'info';
    this.nodeLabel = options.nodeLabel || 'Log';
    this.silent = options.silent || false;
  }

  /**
   * Every winston transport has a core log method
   * @param {string} level (Required) - Level at which to log the message.
   * @param {string} message - Message to log
   * @param {Object} metadata - Metadata to log (Optional)
   * @param {Function} callback - Continuation to respond to when complete.
   */
  log(...args) {
    const level = args.shift() || this.level;
    const message = args.shift() || '';
    let metadata = args.shift();
    let callback = args.shift();

    if (typeof metadata === 'function') {
      callback = metadata;
      metadata = {};
    }

    const { instance, nodeLabel } = this;

    return instance
      .create(nodeLabel, {
        timestamp: moment().utc().toDate(),
        level,
        message,
        metadata: JSON.stringify(metadata),
      })
      .then(() => callback(null, true))
      .catch((err) => callback(err));
  }
}

export default { Neo4jTransport };
