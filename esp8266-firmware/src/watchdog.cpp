#include <Arduino.h>

#define ACC_RELAY D1
#define BATTERY_RELAY D2

#define SWITCHOVER_DELAY 200

#define CAN_NO_MESSAGES_TIMEOUT 30000

#define SHUTDOWN_WAIT_TIME 60000

long unsigned int shutdownAt = 0;

long unsigned int lastMessageMillis;

void changeToBattery()
{
    // Connect to the battery source
    digitalWrite(BATTERY_RELAY, HIGH);
    // Wait for the complete switch to battery
    delay(SWITCHOVER_DELAY);
    // Disconnect the accessory source
    digitalWrite(ACC_RELAY, HIGH);
    // Notify running on battery
    Serial.println("S|running_on_battery");
}

void powerOff()
{
    // Disconnect battery
    // remove this comment
    digitalWrite(BATTERY_RELAY, LOW);
}

void setupPowerRelays()
{
    pinMode(ACC_RELAY, OUTPUT);
    pinMode(BATTERY_RELAY, OUTPUT);
    changeToBattery();
}

void keepAlive(){
    lastMessageMillis = millis();
}

void watchdogLoop()
{

    if ((lastMessageMillis + CAN_NO_MESSAGES_TIMEOUT) < millis() && shutdownAt < 1)
    {
        Serial.println("S|shutdown_request");
        shutdownAt = millis() + SHUTDOWN_WAIT_TIME;
    }

    if (shutdownAt > 0 && millis() > shutdownAt)
    {
        powerOff();
    }
}