/**
 * class 'Hotword'
 * edit by yazhou.miao
 */

const fs = require('fs');
const _ = require('lodash');
class Hotword {
  constructor (config) {
    config = config || {};
    
    if (typeof config.file === 'string') {
        if(!fs.existsSync(config.filepath)){
            console.error('"' + config.filepath + '" is not a valid file path');
            return;
        }
    } else if(_.isArray(config.file)){
        _.forEach(config.file, (file) => {
            if(!fs.existsSync(file)){
                console.error('"' + file + '" is not a valid file path');
                return;
            }
        })
    } else {
        console.error('"' + file + '" valid file path');
        return;
    }

    this.file = config.file;
    this.sensitivity = config.sensitivity > 0 && config.sensitivity <= 1 ? config.sensitivity : 0.5;
    this.alias = config.alias ? config.alias : 'alice';
    this.callback = config.callback;
  }

  trigger() {
    if(typeof this.callback === 'function') {
      this.callback();
    } else {
      console.error('callback is not a function!');
    }
  }
}


module.exports = Hotword;