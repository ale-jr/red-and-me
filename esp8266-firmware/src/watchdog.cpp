#include <Arduino.h>

#define ACC_RELAY 3
#define BATTERY_RELAY 2

#define SWITCHOVER_DELAY 200

#define CAN_NO_MESSAGES_TIMEOUT 5000

#define SHUTDOWN_WAIT_TIME 10000

long unsigned int shutdownAt = 0;

long unsigned int lastMessageMillis;

void changeToBattery()
{
    // Connect to the battery source
    digitalWrite(BATTERY_RELAY, LOW);
    // Wait for the complete switch to battery
    delay(SWITCHOVER_DELAY);
    // Disconnect the accessory source
    digitalWrite(ACC_RELAY, LOW);
    // Notify running on battery
    Serial.println("S|running_on_battery");
}

void powerOff()
{
    // Disconnect battery
    // remove this comment
    digitalWrite(BATTERY_RELAY, HIGH);
    digitalWrite(ACC_RELAY, HIGH);
}

void setupPowerRelays()
{
    pinMode(ACC_RELAY, OUTPUT);
    digitalWrite(ACC_RELAY, HIGH);
    pinMode(BATTERY_RELAY, OUTPUT);
    digitalWrite(BATTERY_RELAY, HIGH);

    changeToBattery();
}

void keepAlive()
{
    lastMessageMillis = millis();
}

void watchdogLoop()
{

    if ((millis() - lastMessageMillis) > CAN_NO_MESSAGES_TIMEOUT && shutdownAt < 1)
    {
        Serial.println("S|shutdown_request");
        shutdownAt = millis() + SHUTDOWN_WAIT_TIME;
    }
    else if (shutdownAt > 0 && millis() > shutdownAt)
    {
        powerOff();
    }
}