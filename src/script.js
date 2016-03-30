'use strict';

  var app = angular.module('quickplot', []);


app.controller('serial', function($scope){
  var storageSize = 20;
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
  var smoothieObj = {};
  var smoothieLines = {};
  var colors = ["#0000FF", "#00FF00", "#FF0000", "#00FFFF", "#FF00FF", "#FFFF00"];

  
  $scope.dataTables = {};
  $scope.isOpen = false;
  $scope.ports = ["..."];
  $scope.keys = [];

  $scope.baudrates = [
    {id:1, name: "300"},
    {id:2, name: "600"},
    {id:3, name: "1200"},
    {id:4, name: "2400"},
    {id:5, name: "4800"},
    {id:6, name: "9600"},
    {id:7, name: "14400"},
    {id:8, name: "19200"},
    {id:9, name: "28800"},
    {id:10, name: "38400"},
    {id:11, name: "57600"},
    {id:12, name: "115200"}
  ];
  $scope.setBaudrate = $scope.baudrates[5];

  // ------------ Inputs ----------------

  var storeData = function(data) {
    var key = data.shift();
    var data = data[0];
    if(
      key.indexOf("�") > -1 && // probably incorrect baudrate, exit function
      !isNaN(parseFloat(data)) && // not a number
      isFinite(data))
    {
      return; 
    }
    if (!($scope.keys.indexOf(key) > -1)) { // key is new
      serialData[key] = Array();
      $scope.keys.push(key);
    } else {
      if (serialData[key].length > storageSize) {
        serialData[key].shift();
      }
    }
    serialData[key].push(Number(data));
    // console.log(serialData[key].values);
  }

  $scope.plotData = function(key) {
    setTimeout(function(){  // use timeout to make sure ng-repeat has finished for new key
      plotData(key);
    }, 200);

  }

  var plotData = function(key) {
    // create new smoothie chart and store in object by key
    smoothieObj[key] = new SmoothieChart({millisPerPixel:43,
      grid:{fillStyle:'#f3f3f3'},
      labels:{fillStyle:'#000000'},
      timestampFormatter:SmoothieChart.timeFormatter
    });
    // connect smoothie to canvas
    smoothieObj[key].streamTo(document.getElementById(key));

    // create new timeseries for key value
    smoothieLines[key] = new TimeSeries;
    // add line to smoothie object
    smoothieObj[key].addTimeSeries(smoothieLines[key], 
      {lineWidth:2,strokeStyle:colors[0]});


    $scope.$watch(function($scope) {
        return serialData[key];
    }, function() {
      var newValue = serialData[key][serialData[key].length-1];
      smoothieLines[key].append(new Date().getTime(), newValue);
    }, true);
  }

  // allow changing back to autoscale
  $scope.rangeChange = function(graphKey){
    var obj = smoothieObj[graphKey].options;
    if(obj.minValue==""){
      delete obj.minValue;
    }
    if(obj.maxValue==""){
      delete obj.maxValue;
    }
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
      serial.open(function (error) { // open the port and handle possible errors
          if ( error ) {
            console.log('failed to open serial: ' + error);
          } else {
            console.log('opened Serial with baudrate ' + serial.options.baudRate);
            serial.flush(); // flush serial for old data
            $scope.isOpen = true;
            // start smoothie graphs in case they were stopped
            for(var key in smoothieObj){
              smoothieObj[key].start();
            }
          };
      });

      serial.on('data', function (data){ // parse all the serial data
        storeData(data.split(" "));
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
      for(var key in smoothieObj){
        smoothieObj[key].stop();
      }
    };
  };
  
  setInterval(function() {
      $scope.$apply() 
  }, 50);

  $scope.init = function() {
    $scope.getSerialPorts();
  }
});
