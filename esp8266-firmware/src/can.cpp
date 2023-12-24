#include "can.h"
#include <Arduino.h>
#include <mcp_can.h>
#include <SPI.h>

#include <carState.h>
#include <watchdog.h>

#define TOGGLE_SNIFFER 9
#define SNIFFER_LED 8

#define CAN0_INT 1
#define CAN0_CS 7

#define STEERING_WHEEL_CONTROL_ID 0x86284000
#define LIGHT_ID 0x82214000
#define BRAKE_ID 0x86264000
#define DOOR_ID 0x86214000
#define TRANSMISSION_ID 0x8421400B

bool enableSniffer = false;

MCP_CAN CAN0(CAN0_CS);

void setupCan()
{
    byte status = CAN0.begin(MCP_ANY, CAN_50KBPS, MCP_8MHZ);

    if (status == CAN_OK)
    {
        Serial.println("S|can_ok");
    }
    else
    {
        Serial.print("S|can_error|");
        Serial.println(status);
    }

    CAN0.setMode(MCP_NORMAL);
    pinMode(CAN0_INT, INPUT);
    pinMode(TOGGLE_SNIFFER, INPUT);
    pinMode(SNIFFER_LED, OUTPUT);
    digitalWrite(SNIFFER_LED, HIGH);

}

unsigned long lastId = 0;
unsigned char lastLength = 0;
unsigned char lastBuffer[12];

void printHex(long num)
{
    if (num < 0x10)
    {
        Serial.print("0");
    }
    Serial.print(num, HEX);
}

unsigned long int lastToggleSnifferPressTime = 0;

void canLoop()
{
    bool toggleSnifferRead = digitalRead(TOGGLE_SNIFFER);
    if (toggleSnifferRead == false)
    {
        if ((millis() - lastToggleSnifferPressTime) > 100)
        {
            enableSniffer = !enableSniffer;
            Serial.print("enable: ");
            Serial.println(enableSniffer);
            digitalWrite(SNIFFER_LED, !enableSniffer);
        }
        lastToggleSnifferPressTime = millis();
    }

    if (digitalRead(CAN0_INT))
        return;

    unsigned long id = 0;
    unsigned char length = 0;
    unsigned char buffer[12];
    CAN0.readMsgBuf(&id, &length, buffer);

    if (enableSniffer)
    {
        printHex(id);
        Serial.print(",00,00,");
        for (int i = 0; i < length; i++)
        {
            printHex(buffer[i]);
        }
        Serial.println();
    }

    keepAlive();
    handleMessage(id, length, buffer);
}

void handleSteeringWheelControlsMessage(unsigned char buffer[12])
{
    SteeringWheelControls state = {
        .leftUp = false,
        .leftMiddle = false,
        .leftDown = false,
        .rightUp = false,
        .rightMiddle = false,
        .rightDown = false,
        .mute = false,
        .voiceAssistant = false,
        .acceptCall = false,
        .endCall = false,
    };

    byte firstByte = buffer[0];
    byte secondByte = buffer[1];

    if (firstByte == 16 && secondByte == 0)
        state.leftUp = true;
    else if (firstByte == 4 && secondByte == 0)
        state.leftMiddle = true;
    else if (firstByte == 8 && secondByte == 0)
        state.leftDown = true;
    else if (firstByte == 128 && secondByte == 0)
        state.rightUp = true;
    else if (firstByte == 0 && secondByte == 128)
        state.rightMiddle = true;
    else if (firstByte == 64 && secondByte == 0)
        state.rightDown = true;
    else if (firstByte == 32 && secondByte == 0)
        state.mute = true;
    else if (firstByte == 0 && secondByte == 64)
        state.voiceAssistant = true;
    else if (firstByte == 2 && secondByte == 0)
        state.acceptCall = true;
    else if (firstByte == 1 && secondByte == 0)
        state.endCall = false;
    updateSteeringwheelControls(state);
}

void handleBrakeMessage(unsigned char buffer[12])
{
    Lights currentLigths = getCurrentState().lights;
    Lights lights = {
        .highBeam = currentLigths.highBeam,
        .lowBeam = currentLigths.lowBeam,
        .brake = buffer[4] == 0x13,
        .leftTurnSignal = currentLigths.leftTurnSignal,
    };
    updateLights(lights);
}

void handleLightWithoutBrakeMessage(unsigned char buffer[12])
{
    Lights currentLigths = getCurrentState().lights;

    bool highBeam = buffer[1] == 0x10 || buffer[1] == 0x78;
    bool lowBeam = buffer[1] == 0x68 || buffer[1] == 0x78;

    bool leftTurnSignal = buffer[2] == 0x40 || buffer[2] == 0x60;
    bool rightTurnSignal = buffer[2] == 0x20 || buffer[2] == 0x60;

    Lights lights = {
        .highBeam = highBeam,
        .lowBeam = lowBeam,
        .brake = currentLigths.brake,
        .leftTurnSignal = leftTurnSignal,
        .rightTurnSignal = rightTurnSignal,
    };
    updateLights(lights);
}

void handleTransmissionMessage(unsigned char buffer[12])
{

    short gear;
    bool manual = buffer[1] == 0x04;
    switch (buffer[2])
    {
    case 0x1E:
        gear = 0;
        break;
    case 0x1C:
        gear = -1;
        break;
    case 0x02:
        gear = 1;
        break;
    case 0x04:
        gear = 2;
        break;
    case 0x06:
        gear = 3;
        break;
    case 0x08:
        gear = 4;
        break;
    case 0x0A:
        gear = 5;
        break;
    }

    Transmission transmission = {
        .manual = manual,
        .gear = gear};
    updateTransmission(transmission);
}

void handleDoorMessage(unsigned char buffer[12])
{
    byte state = buffer[1];
    bool driver = (state & 0x4) != 0;
    bool passenger = (state & 0x8) != 0;
    bool trunk = (state & 0x40) != 0;
    Doors doors = {
        .driver = driver,
        .passenger = passenger,
        .trunk = trunk};

    updateDoors(doors);
}

void handleMessage(unsigned long id, unsigned char length, unsigned char buffer[12])
{
    switch (id)
    {
    case STEERING_WHEEL_CONTROL_ID:
        handleSteeringWheelControlsMessage(buffer);
        break;
    case BRAKE_ID:
        handleBrakeMessage(buffer);
        break;
    case LIGHT_ID:
        handleLightWithoutBrakeMessage(buffer);
        break;
    case TRANSMISSION_ID:
        handleTransmissionMessage(buffer);
        break;
    case DOOR_ID:
        handleDoorMessage(buffer);
        break;
    }
}
