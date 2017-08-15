/*
* dcs hotword server
*/
const DcsClient=require("./dcs_client");
const DcsController=require("./dcs_controller");
const config=require("./dcs_config.json");
const child_process=require("child_process");
const fs = require('fs');
const snowboy = require('./snowboy');
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

function callback() {
    bm.add(buffer);
    fs.writeFileSync("wake.pcm",bm.toBuffer());
    bm.clear();
    if(config.respeaker_2mic_hat && config.respeaker_2mic_hat.led){
        controller.startRecognize();
    }else{
        var cmd=config.play_cmd+" -t wav '"+__dirname+"/nihao.wav'";
        child_process.exec(cmd,()=>{
            controller.startRecognize();
        });
    }
}

module.exports.alice = new Hotword({
    file: [config.snowboy_model_dir + '/alice.pmdl', config.snowboy_model_dir + '/alice_fm.pmdl',],
    sensitivity: 0.5,
    alias: 'alice',
    callback: callback
});
