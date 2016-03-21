/*
  quickplot.cpp - Library for quickly plotting serial data
  Created by Anne Steenbeek, March 21, 2016.
  Released into the public domain.
*/

#include "Arduino.h"
#include "quickplot.h"

unsigned long time;
HardwareSerial* serial;
int plotSize = 0; // amount of items to plot

union plotTypes {
  int i;
  float f;
  double d;
  bool b;
};

struct plotData {
  String name;
  unsigned long lastPlot;
};

plotData plotList[10];

quickplot::quickplot(HardwareSerial &mySerial) {
    serial = &mySerial; //operate on the adress of print
}

// use function overloading to handle multiple data types
// void plotValue(String name, int value, int interval) {
//   double _value = (double) value;
//   plotValue(name, _value, interval);
// }

// void plotValue(String name, float value, int interval) {
//   double _value = (double) value;
//   plotValue(name, _value, interval);
// }

// void plotValue(String name, bool value, int interval) {
//   double _value = (double) value;
//   plotValue(name, _value, interval);
// }

// save values and their respective types using functino overloading
void quickplot::plotValue(String name, float value, int interval) {
  // check if new item
  bool plotExists = false;
  time = millis();
  for (int i = 0; i < plotSize; i++) {
    if (plotList[i].name == name) {
      // plot exists
      plotExists = true;
      // check if it is time to plot
      if (time - plotList[i].lastPlot >= interval) {
        // plot the value
        // serial -> print("name ");
        serial -> print(plotList[i].name);
        serial -> print(" ");
        serial -> print(value);
        serial -> print("\n\t");
        plotList[i].lastPlot = time;
      }
    }
  }
  // plot does not exists and entry needs to be added
  if (!plotExists) {
    // TODO increment structure memory if size is exceded
    plotList[plotSize].name = name;
    plotList[plotSize].lastPlot = millis();
    plotSize++; 
  }
}