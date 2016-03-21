/*
  quickplot.cpp - Library for quickly plotting serial data
  Created by Anne Steenbeek, March 21, 2016.
  Released into the public domain.
*/

#include "Arduino.h"
#include "quickplot.h"

unsigned long time;
int structSize = 10; // value to set the size of the plots structure 
HardwareSerial* serial;

// create structure to store different types of values to keep track
enum ElementType {et_int, et_flt, et_dbl, et_bol};
struct Element {
  ElementType type;
  // union {
    int       i;
    float     f;
    double    d;
    bool      b;
  // }
  String name;
  int interval;
  unsigned long lastPlot;
};


struct Element *plotData = (struct Element*) malloc(sizeof(struct Element) * structSize);
int objectCount = 0; // keeps track of amount of values to plot

quickplot::quickplot(HardwareSerial &mySerial) {
    serial = &mySerial; //operate on the adress of print
}

// save values and their respective types using functino overloading
void quickplot::plotValue(String name, int &value, int interval) {
    plotData[objectCount].type = et_int;
    plotData[objectCount].i = value;
    setPlotData(name, interval);

}

void quickplot::plotValue(String name, float &value, int interval) {
    plotData[objectCount].type = et_flt;
    plotData[objectCount].f = value;
    setPlotData(name, interval);

}

void quickplot::plotValue(String name, double &value, int interval) {
    plotData[objectCount].type = et_dbl;
    plotData[objectCount].d = value;
    setPlotData(name, interval);

}

void quickplot::plotValue(String name, bool &value, int interval) {
    plotData[objectCount].type = et_bol;
    plotData[objectCount].b = value;
    setPlotData(name, interval);

}

void quickplot::setPlotData(String name, int interval) {
    plotData[objectCount].name = name;
    plotData[objectCount].interval = interval;
    plotData[objectCount].lastPlot = millis();
    objectCount++;

}

void quickplot::send() {
    time = millis();
    for (int i = 0; i < objectCount; i++) {
        // Check if it is time to send current value
        if (time - plotData[i].lastPlot >= plotData[i].interval) {
            serial -> print("name ");
            serial -> print(plotData[i].name);
            serial -> print(" value ");
            // get the value to print according to their type
            switch(plotData[i].type) {
              case et_int: serial -> print(plotData[i].i); break;
              case et_flt: serial -> print(plotData[i].f); break;
              case et_dbl: serial -> print(plotData[i].d); break;
              case et_bol: serial -> print(plotData[i].b); break;
            }
            serial -> print("\n\t");

            plotData[i].lastPlot = time; // set new prev time
        }
    }

}