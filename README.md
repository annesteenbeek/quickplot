# Quickplot
Simple tool to track, visualize and store Arduino serial data. 
## Quick install
To get started and run right away, you can download the packages [**here**](https://www.dropbox.com/sh/affs0kikeiiugiv/AABzh9CSijc8Wq6Yxoa1M7Q4a?dl=0).
Quickplot does not need a full installation and is portable.

(OSx version not available, since i don't have a mac available to test or build on)

## Using
Use the provided arduino library to plot the data.
Basicly all this does is print using a simple specified format but with the library you can also set a specified interval.

create quickplot object
```
quickplot plotter([serial port reference]);
```
And to send data to quickplot simply add the desired value in the loop:
```
plotter.plotValue([Desired name of plot], [pointer to variable], [interval]);
```


#### Simple arduino example
```
#include <quickplot.h> // Include the library

int val =  0;
float data1 = 0;
float data2 = 0;
quickplot plotter(Serial); // pass serial object to the plotter

void setup() {
    Serial.begin(9600); 
}

void loop() {
    val++;
    data1 = cos(val/30);
    data2 = sin(val/30);
    // Format: name, value, interval (in millis)
    plotter.plotValue("AliasingTest0", data1, 250);
    plotter.plotValue("AliasingTest1", data1, 10);
    plotter.plotValue("Data2", data2, 100);
}

```

## Screenshot
![missing screenshot](screenshot.png?raw=true "Basic plot of test data")

## Features
- Plot multiple data sets from your micro controller
- Save the data as a .csv file to, for example, use them in Matlab
- Set fixed plotting intervals to get (semi) reliable data frequency
- Simple to use

## Developer Installation
Requirements
- Node
- Bower


To install this package simply clone this repo and then to get started:
```
$ git clone https://github.com/annesteenbeek/quickplot.git # get the repo
$ cd quickplot # enter directory
$ npm install # install node dependencies
$ bower install # install bower files
$ npm install -g node-pre-gyp # the nodeSerial package needs to be rebuild for using it with NWJS
$ cd node_modules/serialport # go into the serialport directory
$ node-pre-gyp rebuild --runtime=node-webkit --target=0.12.0
$ cd ../.. # go back to main directory
$ npm start # to run the plotter
```

note: For building running on windows, please read the installation requirements for node-serialport on windows on their [page](https://github.com/voodootikigod/node-serialport).

## Building
If you want to build yourself, edit the `package.js` file to select platforms and run `grunt build` to start the build.
note: In windows, rename the quickplot.exe executable to nw.exe, [readme](https://github.com/nwjs/nw.js/wiki/using-node-modules)


## TODO
- [x] improve current basic arduino library with multiple data types
- [x] single executable
- [x] more robust serial transmission
- [x] track multiple values in one graph
- [x] Download values as .csv files
- [ ] pushing values to the micro controller
- [ ] add mbed support
- [ ] use more advanced plotting library (values on hover etc...)

