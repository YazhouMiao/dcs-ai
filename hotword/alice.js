/*
* dcs hotword server
*/
const DcsClient = require("../dcs_client");
const DcsController = require("../dcs_controller");
const config = require("../dcs_config.json");
const child_process = require("child_process");
const fs = require('fs');
const path = require('path');
const snowboy = require('../snowboy');
const Hotword = require('../hotword');

var client = new DcsClient({recorder: snowboy.recorder});

let controller = new DcsController();

controller.setClient(client);

controller.on("directive",(response)=>{
    console.log("on directive: "+JSON.stringify(response,null,2));
});

controller.on("event",(eventData)=>{
    console.log("send event:"+JSON.stringify(eventData,null,2));
});

function callback(buffer) {
    snowboy.bm.add(buffer);
    fs.writeFileSync("wake.pcm", snowboy.bm.toBuffer());
    snowboy.bm.clear();
    
    var cmd = config.play_cmd + " -t wav '" + path.resolve(__dirname,"/../resource/sound/nihao.wav'");
    child_process.exec(cmd,()=>{
        controller.startRecognize();
    });
}

module.exports = new Hotword({
    file: [__dirname + '/../snowboy/resources/alice.pmdl', __dirname + '/../snowboy/resources/alice_fm.pmdl',],
    sensitivity: 0.5,
    alias: 'alice',
    callback: callback
});
