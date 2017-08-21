import {HotwordModels} from "./snowboy/lib/node/index";

const Detector = require('./snowboy').Detector;
const Models = require('./snowboy').Models;
const Recorder = require("./recorder");
const Hotword = require('./hotword');
const BufferManager=require("./wakeup/buffermanager").BufferManager;
const _ = require('lodash');

const models = new Models();
let recorder=new Recorder();
let bm = new BufferManager();
let hotwords = [];
let snowboy = {};
let init = false;
let detector, audioStream;

snowboy.init = function(words){
    if(init) {
        console.log('Snowboy initialization has been called.');
        return;
    }
    init = true;
    
    words = words || {};
    
    // add hotword to model
    if(_.isArray(words)) {
        _.forEach(words, addHotword);
    } else {
        addHotword(words);
    }
    
    detector = new Detector({
        resource: __dirname+"/snowboy/resources/common.res",
        models: models,
        audioGain: 1.0
    });
    
    detector.on('silence', function () {
        bm.clear();
    });
    
    detector.on('sound', function (buffer) {
        bm.add(buffer);
    });
    
    detector.on('error', function () {
        console.log('snowboy error');
    });
    
    detector.on('hotword', function (index, hotword, buffer) {
        // <buffer> contains the last chunk of the audio that triggers the "hotword"
        // event. It could be written to a wav stream. You will have to use it
        // together with the <buffer> in the "sound" event if you want to get audio
        // data after the hotword.
        console.log('hotword', index, hotword);
        hotwords[hotword].trigger(buffer);
    });
}

snowboy.start = function(){
    if(!init) {
        console.error('Please run init before start.');
        return;
    }
    
    audioStream = recorder.start().out();
    audioStream.pipe(detector);
};

snowboy.stop=function(){
    audioStream.unpipe(detector);
};

snowboy.bm = bm;

snowboy.recorder = recorder;

// add hotword
function addHotword(hotword){
    if(hotword instanceof Hotword) {
        if(_.isArray(hotword.file)) {
            _.forEach(hotword.file, (filepath) => {
                models.add({
                    file: filepath,
                    sensitivity: hotword.sensitivity,
                    hotwords: hotword.alias
                });
            })
        } else {
            models.add({
                file: hotword.file,
                sensitivity: hotword.sensitivity,
                hotwords: hotword.alias
            });
        }
        
        hotwords[hotword.alias] = hotword;
    } else {
        console.error('Please give a Hotword instance paramater.');
    }
}

module.exports = snowboy;
// module.exports.on=detector.on.bind(detector);
// module.exports.once=detector.once.bind(detector);
// module.exports.removeListener=detector.removeListener.bind(detector);
// module.exports.removeAllListeners=detector.removeAllListeners.bind(detector);
