# quickplot
Simple node tool to plot serial data for arduino.

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

```
Serial.print(#name of the data without spaces);
Serial.print(" ");
Serial.print(value);
Serial.print("\n\t");
```

## screenshot
![missing screenshot](screenshot.png?raw=true "Basic plot of test data")

## TODO
- track multiple values in one graph
- improve current basic arduino library with multiple data types
- add mbed support
- single executable
- bugfixes

