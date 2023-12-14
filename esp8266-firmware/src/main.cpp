#include <Arduino.h>
#include <can.h>
#include <watchdog.h>
#include <debug.h>
#include <keyboard.h>
#define DEBUG_MODE true
void setup()
{
  Serial1.begin(115200, SERIAL_8N1, 20, 21);
  setupPowerRelays();
  delay(3000);
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