#include <Arduino.h>
#include <can.h>


void setup() {
  Serial.begin(115200);
  setupCan();
}

void loop() {
  canLoop();
  debugLoop();
}