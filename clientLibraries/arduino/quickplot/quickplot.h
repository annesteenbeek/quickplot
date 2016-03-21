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
        quickplot(HardwareSerial &mySerial);
        // void plotValue(String name, int value, int interval);
        void plotValue(String name, float value, int interval);
        // void plotValue(String name, double value, int interval);
        // void plotValue(String name, bool value, int interval);

    private:
};

#endif