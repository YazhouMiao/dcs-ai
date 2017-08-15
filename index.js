/*
* Copyright (c) 2017 Baidu, Inc. All Rights Reserved.
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*   http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
const DcsClient=require("./dcs_client");
const DcsController=require("./dcs_controller");
const config=require("./dcs_config.json");
const child_process=require("child_process");
const fs = require('fs');
const snowboy = require('./snowboy');


var client=new DcsClient({recorder: snowboy.recorder});

let controller=new DcsController();

controller.setClient(client);

controller.on("directive",(response)=>{
    console.log("on directive: "+JSON.stringify(response,null,2));
});

controller.on("event",(eventData)=>{
    console.log("send event:"+JSON.stringify(eventData,null,2));
});


function onKeypressed(){
    if(controller.isPlaying()){
        controller.stopPlay();
        controller.stopRecognize();
        return;
    }
    console.log("keypress!!");
    if(controller.isRecognizing()){
        console.log("stopRecognize!!");
        controller.stopRecognize();
        //recorder.stderr().unpipe(process.stderr);
    }else{
        console.log("startRecognize!!");
        controller.startRecognize();
        //recorder.stderr().pipe(process.stderr);
    }
}

var keypress = require('keypress');
keypress(process.stdin);
process.stdin.on("keypress",onKeypressed);


if(config.respeaker_2mic_hat && config.respeaker_2mic_hat.led){
    const bind_led = require('./bind_led');
    bind_led(controller);
}


if(config.respeaker_2mic_hat && config.respeaker_2mic_hat.button){
    const respeaker_btn= require('./respeaker_btn');
    respeaker_btn.on("click",onKeypressed);
}


var unameAll=child_process.execSync("uname -a").toString();
var isRaspberrypi=unameAll.match(/raspberrypi/);



snowboy.on("hotword",function(index, hotword, buffer){
    console.log("hotword "+index);
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
});
