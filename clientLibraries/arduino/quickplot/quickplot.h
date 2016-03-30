/*
  quickplot.h - Library for quickly plotting serial data
  Created by Anne Steenbeek, March 21, 2016.
  Released into the public domain.
*/

#ifndef QUICKPLOT_H
#define QUICKPLOT_H

#include "Arduino.h"

class quickplot {
    public:
        quickplot(HardwareSerial &mySerial) {
            serial = &mySerial; //operate on the adress of print
        }

        // template <typename T>
        // void plotValue(String name, T value, int interval) {
        //   T tmpValue[1];
        //   tmpValue[0] = value;
        //   plotValue(name, tmpValue, interval);
        // }

        template <typename T>
        void plotValue(String name, T value, int interval) {
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
                serial -> print("\t");
                serial -> print(value);
                // for (int j=0; j < sizeof(value); j++) {
                  // serial -> print(value[j]);
                  // if (j != sizeof(value)) {
                    // serial -> print(" ");
                  // }
                // }
                serial -> print("\n");
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

    private:
      struct plotData {
        String name;
        unsigned long lastPlot;
      };

      unsigned long time;
      HardwareSerial* serial;
      int plotSize = 0; // amount of items to plot
      plotData plotList[20];
};

#endif