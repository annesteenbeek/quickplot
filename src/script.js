'use strict';

// Load native UI library
var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

// Get the current window
var win = gui.Window.get();

var app = angular.module('quickplot', ["ui.multiselect"]);

app.controller('serial', function($scope){
  var storageSize = 100;
  var minEntrys = 3; // minimum data points for tracked value to be real

  // -------- Setup serial --------
  var serialport = require("serialport");
  $scope.serialName = ' '; // start with empty port
  var serial = new serialport.SerialPort($scope.serialName,{
    baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      flowControl: false,
      parser: serialport.parsers.readline("\n")
  }, false); // don't open serialport at startup.

  var serialData = {};
  $scope.smoothieObj = {};
  var smoothieLines = {};
  var colors = ["#0000FF", "#00FF00", "#FF0000", "#00FFFF", "#FF00FF", "#FFFF00"];

  
  $scope.dataTables = {};
  $scope.isOpen = false;
  $scope.ports = [];
  $scope.keys = [];

  $scope.baudrates = [
   "300",
   "600",
   "1200",
   "2400",
   "4800",
   "9600",
   "14400",
   "19200",
   "28800",
   "38400",
   "57600",
   "115200"
  ];
  $scope.setBaudrate = $scope.baudrates[5];
  $scope.plotLines = {};
  // ------------ Inputs ----------------

  var storeData = function(data) {
    var key = data.shift();
    var data = data[0];
    if(
      key.indexOf("�") > -1 || // probably incorrect baudrate, exit function
      isNaN(parseFloat(data)) || // not a number
      !isFinite(data))
    {
      return; 
    }
    if (typeof serialData[key] === "undefined") { // key is new
      serialData[key] = Array();
    } else {
      // make sure entry is not an anomaly
      if (serialData[key].length > minEntrys && ($scope.keys.indexOf(key) <= -1)) { 
        $scope.keys.push(key);
    }
      if (serialData[key].length + 1 > storageSize) {
        serialData[key].shift();
      }
    }
    serialData[key].push(Number(data));
  }

  $scope.plotData = function(key) {
    setTimeout(function(){  // use timeout to make sure ng-repeat has finished for new key
      plotData(key);
    }, 100);

  }

  var plotData = function(key) {
    // needed to set correct multiselect values... (dirty)
    $scope.$apply();
    $scope.keys.forEach(function(entry){
      $scope.plotLines[entry] = [];
      $scope.$apply();
    })
    // create new smoothie chart and store in object by key
    $scope.smoothieObj[key] = new SmoothieChart({millisPerPixel:43,
      grid:{fillStyle:'#f3f3f3'},
      labels:{fillStyle:'#000000'},
      timestampFormatter:SmoothieChart.timeFormatter
    });
    // connect smoothie to canvas
    $scope.smoothieObj[key].streamTo(document.getElementById(key));

    // create new timeseries for key value
    smoothieLines[key] = new TimeSeries;
    

    // watch for line changes
    $scope.$watch(function($scope) {
        return $scope.plotLines[key];
    }, function(newVal, oldVal) {
      var removed = $(oldVal).not(newVal).get();
      var added = $(newVal).not(oldVal).get();
      console.log("removed: " + removed);
      console.log("added: " + added);
      removed.forEach(function(entry) {
        $scope.smoothieObj[key].removeTimeSeries(smoothieLines[entry]);
      });
      added.forEach(function(entry) {
        // get color for this key
        var colorIndex = ($scope.keys.indexOf(entry) % (colors.length - 1));

        $scope.smoothieObj[key].addTimeSeries(smoothieLines[entry], 
          {lineWidth:2,strokeStyle:colors[colorIndex]});
      })
    }, true);

    $scope.$watch(function($scope) {
        return serialData[key];
    }, function() {
      var newValue = serialData[key][serialData[key].length-1];
      smoothieLines[key].append(new Date().getTime(), newValue);
    }, true);

    // needed to set correct multiselect values... (dirty)
    $scope.$apply();
    $scope.keys.forEach(function(entry){
      $scope.plotLines[entry] = [entry];
      $scope.$apply();
    })

  }

  // allow changing back to autoscale
  $scope.rangeChange = function(graphKey){
    var obj = $scope.smoothieObj[graphKey].options;
    if(obj.minValue==""){
      delete obj.minValue;
    }
    if(obj.maxValue==""){
      delete obj.maxValue;
    }
  }

  $scope.removeKey = function(key) {
    var index = $scope.keys.indexOf(key);
    $scope.keys.splice(index, 1);
    console.log("removed " + key + " from " + $scope.keys);
  }

  // --------------- Download csv ------------
  $scope.getCSV = function (name){
    var csvContent = "data:text/csv;charset=utf-8,";
    var hasNewArray = true;
    var i = 0;
    while(hasNewArray){
      var dataArray = $scope.dataTables[name + String(i)];
      if(typeof dataArray === 'undefined'){
        hasNewArray = false;
      } else {
        var data = [dataArray]; // take into account multiple arrays
        data.forEach(function(dataObject, index){ 
           var dataString = dataObject.join(","); 
             csvContent += index < dataObject.length ? dataString + "," : dataString;
             csvContent += "\n";  
          i++;
        });
      }
    }
      var encodedUri = encodeURI(csvContent);
      // dirty method to set download name
      var link = document.createElement("a");    
      link.href = encodedUri;

      //set the visibility hidden so it will not effect on your web-layout
      // link.style = "visibility:hidden";
      link.download = name + ".csv";
      //this part will append the anchor tag and remove it after automatic click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("downlaoded");
  };

  // --------------- Serial port functions -------------

  $scope.getSerialPorts = function (){
    var portNames = [];
    serialport.list(function (err, portList) {
      portList.forEach(function(port) {
        // console.log(port);
        portNames.push(port.comName);
      });
        if (portNames.length > 0) {
          $scope.ports = portNames;
        }else{
          console.log("No serialports available.");
          $scope.ports = [];
        };
    });
  };

  $scope.openSerial = function (){
    var baudrate = $("#baudSelector option:selected").text();
    var portName = $("#portSelector option:selected").text();

    if (portName != null) { // check if no empty port has ben send
      serial.path = portName;
      serial.options.baudRate = baudrate;
      $scope.closeSerial(); // make sure serial is closed bevore opening it
      serial.open(function (error) { // open the port and handle possible errors
          if ( error ) {
            console.log('failed to open serial: ' + error);
          } else {
            console.log('opened Serial with baudrate ' + serial.options.baudRate);
            serial.flush(); // flush serial for old data
            $scope.isOpen = true;
            // start smoothie graphs in case they were stopped
            for(var key in $scope.smoothieObj){
              $scope.smoothieObj[key].start();
            }
          };
      });

      serial.on('data', function (data){ // parse all the serial data
        storeData(data.split("\t"));
      }); 

      serial.on('error', function(error){ // handle possible serial error
        console.log("warning, Serial error: " + error)
      });

      serial.on('close', function(){
        console.log("Closed serial port: "+serial.path);
        serial.path = "";
      });


      console.log("done opening serial");
    } else {
      console.log("No serial port selected");
    }
  };

  $scope.closeSerial = function (){
    if(serial.isOpen()){
      serial.close();
      console.log("Closed serialPort.");
      $scope.isOpen = false;
      for(var key in $scope.smoothieObj){
        $scope.smoothieObj[key].stop();
      }
    };
  };
  
  setInterval(function() {
      $scope.$apply() 
  }, 50);

  $scope.init = function() {
    $scope.getSerialPorts();
  };

  $scope.arrayToString = function(string){
    if (typeof string !== 'undefined') {
      return string.join(", ");
    }
  };

  win.on('close', function() {
    this.hide(); // Pretend to be closed already
    $scope.closeSerial(); // make sure serial is closed.
    console.log("We're closing...");
    this.close(true);
  });
});
