#include <Arduino.h>
#include <can.h>
#include <watchdog.h>


void setup() {
  Serial.begin(115200);
  setupPowerRelays();
  setupCan();
}

void loop() {
  canLoop();
  debugLoop();
  watchdogLoop();
}