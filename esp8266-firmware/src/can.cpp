#include "can.h"
#include <Arduino.h>
#include <mcp_can.h>
#include <SPI.h>
#include <debug.h>
#include <carState.h>
#include <watchdog.h>

#define CAN0_INT 1
#define CAN0_CS 7

#define STEERING_WHEEL_CONTROL_ID 2250784768

MCP_CAN CAN0(CAN0_CS);

void setupCan()
{
    byte status = CAN0.begin(MCP_ANY, CAN_50KBPS, MCP_8MHZ);

    if (status == CAN_OK)
    {
        Serial1.println("S|can_ok");
    }
    else
    {
        Serial1.print("S|can_error|");
        Serial1.println(status);

        while (true)
        {
            Serial1.println("oh no!");
            delay(1000);
        }
    }

    CAN0.setMode(MCP_NORMAL);
    pinMode(CAN0_INT, INPUT);
}

unsigned long lastId = 0;
unsigned char lastLength = 0;
unsigned char lastBuffer[12];

void canLoop()
{

    if (digitalRead(CAN0_INT))
        return;

    unsigned long id = 0;
    unsigned char length = 0;
    unsigned char buffer[12];
    CAN0.readMsgBuf(&id, &length, buffer);    
    Serial1.print("M|");
    Serial1.print(id);
    Serial1.print("|");
    Serial1.print(length);
    Serial1.print("|");
    for(int i=0;i<length;i++){
        Serial1.print(buffer[i]);
        Serial1.print(",");
    }
    Serial1.println();    
    handleId(id);
    keepAlive();
    if (getDebugMode())
        handleMessageInDebugMode(id, length, buffer);
    else
        handleMessage(id, length, buffer);
}

void handleSteeringWheelControls(unsigned char buffer[12])
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

void handleMessage(unsigned long id, unsigned char length, unsigned char buffer[12])
{
    switch (id)
    {
    case STEERING_WHEEL_CONTROL_ID:
        handleSteeringWheelControls(buffer);
        break;
    default:
        break;
    }
}

void handleMessageInDebugMode(unsigned long id, unsigned char length, unsigned char buffer[12])
{

    if (getSelectedIndex() > -1)
    {
        long unsigned int selectedId = getDiscoveredIds()[getSelectedIndex()];
        if (selectedId == id)
        {
            bool isSameMessage = true;
            for (int i = 0; i < length; i++)
            {
                if (buffer[i] != lastBuffer[i])
                {
                    isSameMessage = false;
                    break;
                }
            }
            if (!isSameMessage)
                printMessage(id, length, buffer);

            lastId = id;
            lastLength = length;
            for (int i = 0; i < length; i++)
            {
                lastBuffer[i] = buffer[i];
            }
        }
    }
}