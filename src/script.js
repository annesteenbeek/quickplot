'use strict';

var app = angular.module('quickplot', []);

app.controller('nodeSerial', function($scope){

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

  $scope.plotData = {};
  $scope.dataTables = {};
  $scope.isOpen = false;
  $scope.ports = ["..."];
  $scope.keys = [];
  $scope.smoothieObj = {};
  $scope.smoothieLines = {};
  $scope.colors = ["#0000FF", "#00FF00", "#FF0000", "#00FFFF", "#FF00FF", "#FFFF00"];
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

  $scope.plotter = function(data) {
    var key = data.shift();
    var data = data[0];
    console.log("data is: " + data);
    if (!($scope.keys.indexOf(key) > -1)) { // key is new
      $scope.keys.push(key);
      $scope.plotData[key] = {};
      $scope.plotData[key].values = new Array(data); 

    } else {
      if ($scope.plotData[key].values.length > storageSize) {
        $scope.plotData[key].values.shift();
      }
      $scope.plotData[key].values.push(data);
    }
    console.log($scope.plotData[key].values);
  }


  // $scope.plotData = function (data){
  //   var key = data.shift();
  //   var data = data;
  //   if(!(key.indexOf("�") > -1)) { // result of incorrect baud rate
  //     if(!($scope.keys.indexOf(key)>-1) && !(key==="")){ // if new key value, creat new data table
  //       $scope.keys.push(key);
  //       // connect smoothie object to html canvas
  //       // create new smoothie chart and store in object by key
  //       $scope.smoothieObj[key] = new SmoothieChart({millisPerPixel:43,
  //         grid:{fillStyle:'#f3f3f3'},
  //         labels:{fillStyle:'#000000'},
  //         timestampFormatter:SmoothieChart.timeFormatter
  //       });
  //       data.forEach(function (value, i){ // for each value in array create different line
  //         $scope.dataTables[key+String(i)] = [value];
  //       });
  //       // create html object canvas
  //       setTimeout(function(){  // use timeout to make sure ng-repeat has finished for new key
  //       $scope.smoothieObj[key].streamTo(document.getElementById(key));
  //         data.forEach(function (value, i){ // for each value in array create different line
  //           // create new timeseries for key value
  //           $scope.smoothieLines[key+String(i)] = new TimeSeries;
  //           // add line to smoothie object
  //           $scope.smoothieObj[key].addTimeSeries($scope.smoothieLines[key+String(i)], 
  //             {lineWidth:2,strokeStyle:$scope.colors[i]});
  //         })
  //       }, 100);
  //     } else {
  //       data.forEach(function (value, i){
  //         var dataTable = $scope.dataTables[key + String(i)];
  //         dataTable.push(value);
  //         var maxArrayLength = 400;
  //         if(dataTable.length > maxArrayLength){
  //           dataTable.shift(); // remove first element if array gets too long
  //         } 
  //         // prevent errors because of delay in canvas creation (first elements are still stored in csv)
  //         // could be improved by use of buffer for the value
  //         if(typeof $scope.smoothieLines[key + String(i)] != 'undefined'){
  //           $scope.smoothieLines[key + String(i)].append(new Date().getTime(), value);
  //         }
  //       })
  //     };
  //   } else {
  //     Console.log("incorrect data, most likely result of incorrect baudrate");
  //   }
  // };

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
            var dropdown = document.getElementById('portSelector');
            $scope.isOpen = true;
            // start smoothie graphs in case they were stopped
            for(var key in $scope.smoothieObj){
              $scope.smoothieObj[key].start();
            }
          };
      });

      serial.on('data', function (data){ // parse all the serial data
        console.log("Received: " + data);
        // $scope.plotData(data.split(" "));
        $scope.plotter(data.split(" "));
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
      // for(var key in $scope.smoothieObj){
      //   $scope.smoothieObj[key].stop();
      // }
    };
  };
  // ----------- at init -----------
  $scope.init = function() {
    $scope.getSerialPorts();
  }
});

