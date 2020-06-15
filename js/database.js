var redis = require("redis");

class Database {
  constructor(serviceName, debug, callback) {
    this.serviceName = serviceName;
    this.debug = debug;
    this.callback = callback;
  }

  /**
   * Prints the Service Name and a message to the console.
   * @param {string} message - The message to print.
   */
  log(message) {
    if (this.debug) {
      console.log(this.serviceName + ' Database: ' + message);
    }
  }

  /**
   * Connects to a redis server and gets the state for an array of channels.
   */
  getChannelValues(channels) {
    if (channels.length > 0) {
      try {
        const db = redis.createClient();
        db.on('error', (err) => {
          this.log("Client error: " + err);
          db.quit();
        });
        db.on('connect', () => {
          channels.forEach(channel => {
            this.log('Getting current value for channel: ' + channel);
            db.get(channel, (err, result) => {
              if (result) {
                this.log(channel + ' = ' + result)
                const data = {
                  command: 'update',
                  channel: channel,
                  origin: 'Database',
                  value: result
                }
                this.callback(data);
              }
            });
          });
          db.quit();
        });
      } catch (e) {
        this.log('Exception subscribing to channels. ' + e);
      }
    }
  }

  /**
   * Connects to a redis server and gets the state for an array of channels.
   */
  getAllChannelValues() {
    try {
      const db = redis.createClient();
      db.on('error', (err) => {
        this.log("Client error: " + err);
        db.quit();
      });
      db.on('connect', () => {
        this.log('Getting all channels.');
        db.smembers('csg.channels', (err, channels) => {
          if (channels) {            
            this.log('Got all channels.');
            this.getChannelValues(channels)
          }
        });
        db.quit();
      });
    } catch (e) {
      this.log('Exception subscribing to channels. ' + e);
    }
  }
}

module.exports = Database;