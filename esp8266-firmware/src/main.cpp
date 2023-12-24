#include <Arduino.h>
#include <can.h>
#include <watchdog.h>
#include <keyboard.h>

void setup()
{
  Serial.begin(115200);
  setupPowerRelays();
  setupCan();
  setupKeyboard();
}

void loop()
{
  canLoop();
  watchdogLoop();
  keyboardLoop();
}