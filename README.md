# quickplot
Simple node tool to plot serial data for arduino. 
Made possible by the great [node-serialport](https://github.com/voodootikigod/node-serialport)

## installation
To install this package simply clone this repo and then to get started:
```
$ npm install # install node dependencies
$ bower install # install bower files
$ npm start # to run the plotter
```

## Providing plotting data
Use the provided arduino library to plot the data.
Basicly all this does is print using a simple specified format but with the library you can also set a specified interval.
### using the provided library

#### simple arduino example
```
#include <quickplot.h>

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
### using basic serial data


```
Serial.print(#name of the data without spaces);
Serial.print(" ");
Serial.print(value);
Serial.print("\n\t");
```

## screenshot
![missing screenshot](screenshot.png?raw=true "Basic plot of test data")

## TODO
- [x] improve current basic arduino library with multiple data types
- [x] single executable
- [ ] more robust serial transmission
- [ ] track multiple values in one graph
- [ ] pushing values to the micro controller
- [ ] add mbed support
- [ ] dragging, dropping and removing of plots
- [ ] use more advanced plotting library (values on hover etc...)

