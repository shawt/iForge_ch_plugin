# iForge_ch_plugin
This is a Chrome App that allows for flashing an arduino from a chromebook over USB-Serial.
It is based on the AVRGirl project -- Thank You!

The following modifications were made to the AVRGirl Package:

# lib/tools.js (line 17)
tools._parseHex = function(file) {
  //try {
    var data=file;
//    if (typeof file === 'string') {
//      data = fs.readFileSync(file, {
//        encoding: 'utf8'
//      });
//    } else {
//      data = file;
//    }
//data=file;
//
//    return intelhex.parse(data).data;
//  } catch (error) {
//    return error;
//  }
    //return file
    return intelhex.parse(data).data;
};

# lib/avr109.js (line 25)
 var data;
  data = file;
//  try {
//    if (typeof file === 'string') {
//      data = fs.readFileSync(file, {
//        encoding: 'utf8'
//      });
//    } else {
//      data = file;
//    }
//  } catch (error) {
//    return callback(error);
//  }

# boards.js (line 13)
{
    name: 'lilypad',
    baud: 57600,
    signature: new Buffer([0x1e, 0x95, 0x0f]),
    pageSize: 128,
    numPages: 256,
    timeout: 400,
    protocol: 'stk500v1'
  },

