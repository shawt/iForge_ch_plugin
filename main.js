/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var SerialPort = require("browser-serialport");

var intel_hex = require('intel-hex');
var usbttyRE = /(cu\.usb|ttyACM|ttyUSB|COM\d+)/;
var Avrgirl = require('avrgirl-arduino');
var serMess;
var _sp;
var _arduinoSerial;
var _bufferHold="";
var _board;
var _ch;


console.log('im alive and well...');

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
      
      if(request.name=="ping"){
          var manifest = chrome.runtime.getManifest();
          var appVer=manifest.version;
          sendResponse({reply: "Plugin Active",version: appVer});
      };
      
  });

chrome.runtime.onConnectExternal.addListener(function(ch) {
    _ch=ch;
    _ch.onMessage.addListener(function(msg) {
        
        switch(msg.success){
            case true:
                packageForFlash(msg);
                break;

            default:
                return null;
        }
    });
    
    switch(_ch.name){
        case "toFlash":
            console.log("got a flash request");
            if(_sp){
                _sp.close();   
            }
            _ch.postMessage({reply: "Ready to recieve compiled code"});
            break;
            
        case "serialConnect":
            _ch.postMessage({reply: "Now opening serial port."});
            getPort(openSerial);
            break;
            
        
        case "serialClose":
            if(_sp){
                _sp.close();
                _ch=null;    
            }
            break;
            
        default: 
            return null;
            break;
    }
});


/*
 * General functions
 */
function getPort(callback){
  Avrgirl.list(function(err, ports) {
  console.log(ports);
  if(err){
      _ch.postMessage({reply: err});
  }
  else{
      _ch.postMessage({reply: "retrieving list of ports"});
  }
  var port;
  for (i=0; i< ports.length; ++i){
      if (usbttyRE.test(ports[i].comName)){
          port=ports[i];
          callback(port.comName);
      }
  }
  
});  
};

function packageForFlash(msg){
    _ch.postMessage({reply: "Sending compiled code to Arduino"});
     data=msg.output;
     hex = intel_hex.parse(data).data;
     if (msg.avrgName !=null) {
         _board=msg.avrgName;
     }
     else{
         _board='uno';
     }
     getPort(flash);
};


function flash(portName){

    avrgirl = new Avrgirl({
        board: _board,
        port: portName,
        debug: true
    });
    _ch.postMessage({reply: "Attempting to flash with AVRGirl"});
        avrgirl.flash(hex, function (error) {
           if (error) {
                      console.error(error);
                      _ch.postMessage({reply: error.message});


           } else {
                      console.info('Avrgirl Programming complete!');
                      _ch.postMessage({reply: "Avrgirl Programming complete!"});
                      _ch=null;
           }
         });
         
};

function onPortOpen(){
    console.log("YESSIR THE PORT IS OPEN COS CAPS");
    _arduinoSerial = '';
};
 
function onData(d)
{
 sendSerialMessage(d);
   
};
 
function onClose(){
    console.log("Port is closed, yo");
};
function onError(){
    console.log("something went horribly wrong");
};

function openSerial(port,ch){ 
    _sp= new SerialPort(port, {
    baudrate: 9600
    }); 
    _sp.on('open', onPortOpen);
    _sp.on('data', onData);
    _sp.on('close', onClose);
    _sp.on('error', onError);
 
 };

function sendSerialMessage(d,ch) {
    // concatenating the string buffers sent via usb port
    var strD=d.toString();
    if (_bufferHold.length>0) {
        console.log("buffer hold is: "+_bufferHold);
      _arduinoSerial +=_bufferHold;
      _bufferHold='';
  };
    
      // if there is a carrage return in the string
    if (strD.indexOf("\r") > -1) {
        //if the carriage return is before the end of the string
        //pull out the first part of the string up to the carriage return
        //tuck it onto the end of _arduinoSerial
        if (strD.indexOf("\r")<strD.length-2){
            //console.log("newline is at " + strD.indexOf("\r"));
            //console.log("str length is " +strD.length);
            //substring does not capture the character in the endPosition parameter, so we tack it on.
            var endOfMsg=strD.substring(0,strD.indexOf("\r"))+"\r\n";
            //put the rest of the string into _bufferHold
            _bufferHold=strD.substring(strD.indexOf("\r")+2,strD.length+1);
            _arduinoSerial+=endOfMsg;
        }
        //if the carriage return is the last character of the string
        //then the whole string can be added onto _arduinoSerial
        else{
            console.log("false");
          _arduinoSerial+=strD;  
        };
        
      
      // send the message to the client
      _ch.postMessage({reply: _arduinoSerial});
      //console.log(_arduinoSerial);
      
        // reset the output string to an empty value
      _arduinoSerial = ''; 
    }
    else {
      _arduinoSerial += d;  
    };
  };
  
  
