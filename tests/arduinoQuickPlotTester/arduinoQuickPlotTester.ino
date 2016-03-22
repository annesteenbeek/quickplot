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
    data1 = cos(((float) val)/30);
    data2 = sin(val/30);
    plotter.plotValue("AliasingTest0", data1, 0);
    plotter.plotValue("AliasingTest1", data1, 10);
    // int data [] = {data1, data2};
    // plotter.plotValue("Data2", data2, 100);
    plotter.plotValue("value", val, 0);
    // plotter.plotValue("AllData", data, 50);
    Serial.print("Sines "); Serial.print(data1); Serial.print(" "); 
    Serial.print(data2); Serial.print("\t");
}
