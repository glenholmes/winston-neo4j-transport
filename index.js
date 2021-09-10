/**
 * @file Winston transport for Neo4j
 * @author Glen Holmes
 */

 import Neode from 'neode';
 import moment from 'moment';
 import Transport from 'winston-transport';
 
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
       throw new Error('You have to define Neo4j url, username and password!');
     }
 
     // Set defaults
     this.level = options.level || 'info';
     this.nodeLabel = options.nodeLabel || 'Log';
     this.silent = options.silent || false;
 
     // Set Neode Instanse
     this.instance = new Neode(options.url, options.username, options.password);
     this.instance.model(this.nodeLabel, {
       timestamp: {
         type: 'datetime',
         required: true,
       },
       level: {
         type: 'string',
         required: true,
       },
       message: {
         type: 'string',
         required: true,
       },
       meta: 'string',
     });
   }
 
   /**
    * Every winston transport has a core log method
    * @param {string} info.level - Level at which to log the message.
    * @param {string} info.message - Message to log
    * @param {Object} info.meta - Metadata to log (Optional)
    * @param {Function} callback - Continuation to respond to when complete.
    */
   log(info, callback) {
     const { level, message, meta } = info;
     setImmediate(() => {
       this.emit('logged', level);
     });
 
     const logData = {
       message,
       level,
       timestamp: moment().utc().toDate(),
       meta: meta ? JSON.stringify(meta) : '',
     };
 
     return this.instance
       .create(this.nodeLabel, logData)
       .then(() => callback(null, true))
       .catch((err) => callback(err));
   }
 }
 
 export default Neo4jTransport; 