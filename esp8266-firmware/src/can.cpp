#include "can.h"
#include <mcp_can.h>
#include <SPI.h>
#include <debug.h>
#include <carState.h>
#include <watchdog.h>

#define CAN0_INT 16
#define CAN0_CS 17

#define STEERING_WHEEL_CONTROL_ID 2250784768

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
}

CanMessage lastMessage = {
    .id = 0,
    .length = 0,
    .buffer = {}};

void canLoop()
{

    if (digitalRead(CAN0_INT))
        return;

    CanMessage message = {};
    CAN0.readMsgBuf(&message.id, &message.length, message.buffer);
    handleId(message.id);
    keepAlive();
    if (getDebugMode())
        handleMessageInDebugMode(message);
    else
        handleMessage(message);
}

void handleSteeringWheelControls(CanMessage message)
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

    byte firstByte = message.buffer[0];
    byte secondByte = message.buffer[1];

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

void handleMessage(CanMessage message)
{
    switch (message.id)
    {
    case STEERING_WHEEL_CONTROL_ID:
        handleSteeringWheelControls(message);
        break;
    default:
        break;
    }
}

void handleMessageInDebugMode(CanMessage message)
{

    if (getSelectedIndex() > -1)
    {
        long unsigned int selectedId = getDiscoveredIds()[getSelectedIndex()];
        if (selectedId == message.id)
        {
            bool isSameMessage = true;
            for (int i = 0; i < message.length; i++)
            {
                if (message.buffer[i] != lastMessage.buffer[i])
                {
                    isSameMessage = false;
                    break;
                }
            }
            if (!isSameMessage)
                printMessage(message.id, message.length, message.buffer);

            lastMessage.id = message.id;
            lastMessage.length = message.length;
            for (int i = 0; i < message.length; i++)
            {
                lastMessage.buffer[i] = message.buffer[i];
            }
        }
    }
}