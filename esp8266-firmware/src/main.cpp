#include <Arduino.h>
#include <can.h>
#include <watchdog.h>
#include <debug.h>
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
  debugLoop();
  watchdogLoop();
  keyboardLoop();
}