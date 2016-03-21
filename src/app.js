var http = require('http');
var express = require('express');
var app = express();
var serialport = require("serialport");
var fs = require("fs");
var json2csv = require('json2csv');

var server = http.createServer(app).listen(3000);
var io = require('socket.io').listen(server);
var i = 0;
var portNames ={};
app.use(express.static(__dirname));
console.log("Created server on port: " + server.address().port)
var skipLines = 0;
// ------- Setup CSV ---------
var storeData = {};
// -------- Setup serial --------
var serialName = ' '; // start with empty port
var serial = new serialport.SerialPort(serialName,{
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\n")
}, false); // don't open serialport at startup.


// --------- Recieved sockets -------
io.sockets.on('connection', function (socket) {
	//Connecting to client 
	console.log('Socket connected');
	socket.emit('connected');
	getSerialPorts(function(portList){
		socket.emit('serialPorts', portList);  // on connection, emit serialports
	});

	if(serial.isOpen()){ // if allready connected to serial, send name
		socket.emit('openedSerial', serial.path);
	}

	socket.on('serialRefresh', function(){
		getSerialPorts(function(portList){
			socket.emit('serialPorts', portList);
		});
	});

	socket.on('openSerial', function(port){
		openSerial(port);
	});

	socket.on('closeSerial', function(){
		closeSerial()
	});

	socket.on("stopAll", function(){
		console.log("trying to stop");
		if (serial.isOpen()) {
			serial.write("stop");
		}
	})

	// Reference for future parameter tuning
	// socket.on('getPIDValues', function(){
	// 	if (serial.isOpen()) {
	// 		serial.write('getPIDValues\n');
	// 	} else {
	// 		console.log("serial not open");
	// 	}
	// });

	// socket.on('setParameter', function(data){
	// 	if (serial.isOpen()) {
	// 		serial.write(data[0] + " " + data[1] + "\n");
	// 	} else {
	// 		console.log("serial not open");
	// 	}
	// })

});

function parseSerial(data){
	// console.log(data);
	if (skipLines==10){ // lines to skip to prevent broken lines at startup
		data = data.split("\t"); // split data in array by tabs
		data.forEach(function (dataset){
			dataset = dataset.split(" "); // split subset by spaces
			io.sockets.emit("serialData", dataset); // emit every key and their values
		});
	}else{
		console.log("skipped: " + data);
		skipLines = skipLines +1;
	};
}

// --------- functions ---------------
function getSerialPorts(callback){
	var portNames = [];
	serialport.list(function (err, portList) {
	  portList.forEach(function(port) {
	  	console.log(port);
	    portNames.push(port.comName);
	  });
	    if (portNames.length > 0) {
	    	callback(portNames);
	    }else{
	    	console.log("No serialports available.");
	    	callback([]);
	    };
	});
};

function openSerial(portName){
	if (portName != null) { // check if no empty port has ben send
		if(serial.isOpen()){
			serial.close();
		}
		serial.path = portName;
		serial.open(function (error) { // open the port and handle possible errors
		  	if ( error ) {
		    	console.log('failed to open serial: '+error);
		    	io.sockets.emit('failed', error);
		  	} else {
			    console.log('opened Serial');
			    io.sockets.emit('openedSerial', serial.path)
		    };
		});
		serial.on('error', function(error){ // handle possible serial error
			console.log("warning, Serial error: " + error)
			io.sockets.emit('serialError', error);
		});

		serial.on('close', function(){
			console.log("Closed serial port: "+serial.path);
			io.sockets.emit('serialClosed', serial.path); // emit conformation of disconnect
			serial.path = "";
		});

		serial.on('data', function (data){ // parse all the serial data
			parseSerial(data); 
		});	

	} else {
		console.log("No serial port selected");
	}
};

function closeSerial(){
	skipLines = 0; // serial needs to buffer again at startup
	if(serial.isOpen()){
		serial.close();
	};
};