#include <quickplot.h>

int val =  0;
float data1 = 0;
float data2 = 0;
Serial mySerial;

quickplot plotter(mySerial);

void setup() {
    mySerial.begin(9600);
    plotter.plotValue("Data1", &data1, 200);
    plotter.plotValue("Data2", &data2, 100);
}

void loop() {
    val++;
    data1 = cos(val/30);
    data2 = sin(val/30);
    plotter.send();
}