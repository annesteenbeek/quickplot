#include <quickplot.h>

int val =  0;
float data1 = 0;
float data2 = 0;
quickplot plotter(Serial);

void setup() {
    Serial.begin(9600);
}

void loop() {
    val++;
    data1 = cos(val/30);
    data2 = sin(val/30);
    plotter.plotValue("AliasingTest0", data1, 250);
    plotter.plotValue("AliasingTest1", data1, 10);
    plotter.plotValue("Data2", data2, 100);
}