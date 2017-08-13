/**
 * class 'Hotword'
 * edit by yazhou.miao
 */

const fs = require('fs');
class Hotword {
  constructor (config) {
    config = config || {};
    if(!config.file || !fs.existsSync(config.file)){
      console.error('initial paramater should have valid file path');
      return;
    }

    this.file = config.file;
    this.sensitivity = config.sensitivity > 0 && config.sensitivity <= 1 ? config.sensitivity : 0.5;
    this.hotwords = config.hotwords;
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