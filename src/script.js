'use strict';

var app = angular.module('MyApp', []);
// --------------- socketio in angularjs ----------
app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

var serialPortList = [];

// ------------ AngularJS -------------------
app.controller('nodeSerial', function($scope, socket){
  $scope.dataTables = {};
  $scope.isOpen = false;
  $scope.ports = ["..."];
  $scope.keys = [];
  $scope.smoothieObj = {};
  $scope.smoothieLines = {};
  $scope.colors = ["#0000FF", "#00FF00", "#FF0000", "#00FFFF", "#FF00FF", "#FFFF00"];

  socket.on('serialPorts', function (input){
    console.log(input);
    $scope.ports = input;
  });

  socket.on("openedSerial", function (input){
    console.log("opened serialport: "+input);
    $scope.isOpen = true;
    var dropdown = document.getElementById('portSelector');
    setTimeout(function(){ // wait to set value to allow angular to create portlist
      dropdown.value = input;
    },500);
    socket.emit('getPIDValues');
    // start smoothie graphs in case they were stopped
    for(var key in $scope.smoothieObj){
      $scope.smoothieObj[key].start();
    }


  });

  socket.on("failed", function (input){
    console.log("failed to connect: "+input);
  });

  socket.on("serialClosed", function (input){
    console.log("Closed serialPort: "+input);
    $scope.isOpen = false;
    for(var key in $scope.smoothieObj){
      $scope.smoothieObj[key].stop();
    }
  });

// ------------ Inputs ----------------
  socket.on("serialData", function (input){
    var key = input.shift();
    var data = input;
      if(!($scope.keys.indexOf(key)>-1)){ // if new key value, creat new data table
        $scope.keys.push(key);
        // connect smoothie object to html canvas
        // create new smoothie chart and store in object by key
        $scope.smoothieObj[key] = new SmoothieChart({millisPerPixel:43,
          grid:{fillStyle:'#f3f3f3'},
          labels:{fillStyle:'#000000'},
          timestampFormatter:SmoothieChart.timeFormatter
        });
        data.forEach(function (value, i){ // for each value in array create different line
          $scope.dataTables[key+String(i)] = [value];
        });
        // create html object canvas
        setTimeout(function(){  // use timeout to make sure ng-repeate has finished for new key
        $scope.smoothieObj[key].streamTo(document.getElementById(key));
          data.forEach(function (value, i){ // for each value in array create different line
            // create new timeseries for key value
            $scope.smoothieLines[key+String(i)] = new TimeSeries;
            // add line to smoothie object
            $scope.smoothieObj[key].addTimeSeries($scope.smoothieLines[key+String(i)], 
              {lineWidth:2,strokeStyle:$scope.colors[i]});
          })
        }, 100);
      }else{
        data.forEach(function (value, i){
          var dataTable = $scope.dataTables[key + String(i)];
          dataTable.push(value);
          var maxArrayLength = 400;
          if(dataTable.length > maxArrayLength){
            dataTable.shift(); // remove first element if array gets too long
          } 
          // prevent errors because of delay in canvas creation (first elements are still stored in csv)
          // could be improved by use of buffer for the value
          if(typeof $scope.smoothieLines[key + String(i)] != 'undefined'){
            $scope.smoothieLines[key + String(i)].append(new Date().getTime(), value);
          }
        })
      };
  });

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

  $scope.stopAll = function(){
    socket.emit("stopAll");
    console.log("stopping");
  }

// --------------- PID tuning -------------
// Reference for future parameter tuning 
// $scope.placePIDValues = function(data){
//   var i = 0;
//   for(var i in parameters){
//     $scope.PIDparameters[parameters[i]] = data[i];
//   }
//   console.log($scope.PIDparameters);
// }


// $scope.sendPID = function(parameter){
//   console.log("setting " + parameter + " " +  $scope.PIDparameters[parameter]);
//   socket.emit('setParameter', [parameter, $scope.PIDparameters[parameter]]);
//   setTimeout(function(){
//     socket.emit('getPIDValues');
//   }, 500);
// }

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

// ------------ Serial port setup ------
  $scope.serialRefresh = function(){
  socket.emit('serialRefresh');
  };

  $scope.openSerial = function(){
    // use jquery to get selected text because of issues with angular after page reload
    console.log("Opening: "+$("#portSelector option:selected").text());
    socket.emit('openSerial', $("#portSelector option:selected").text())
  };
  $scope.closeSerial = function(){
    console.log("Closing serialport");
    socket.emit('closeSerial');
  };
})
