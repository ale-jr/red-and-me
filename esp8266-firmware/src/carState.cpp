#include "carState.h"
#include <Arduino.h>
#include "keyboard.h"
State currentState = {
    .steeringWheelControls = {
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
        .lastChange = 0},
    .lights = {.highBeam = false, .lowBeam = false, .brake = false, .leftTurnSignal = false, .rightTurnSignal = false, .lastChange = 0},
    .doors = {.driver = false, .passenger = false, .trunk = false, .lastChange = 0},
    .transmision = {.manual = false, .gear = 0, .lastChange = 0}};

void printBool(bool value, bool withSeparator)
{
    Serial1.print(value ? "1" : "0");
    if (withSeparator)
    {
        Serial1.print("|");
    }
}

void updateSteeringwheelControls(SteeringWheelControls updated)
{
    SteeringWheelControls state = currentState.steeringWheelControls;
    bool hasChanges =
        state.leftUp != updated.leftUp ||
        state.leftMiddle != updated.leftMiddle ||
        state.leftDown != updated.leftDown ||
        state.rightUp != updated.rightUp ||
        state.rightMiddle != updated.rightMiddle ||
        state.rightDown != updated.rightDown ||
        state.mute != updated.mute ||
        state.voiceAssistant != updated.voiceAssistant ||
        state.acceptCall != updated.acceptCall ||
        state.endCall != updated.endCall;

    if (hasChanges)
    {
        currentState.steeringWheelControls = {
            .leftUp = updated.leftUp,
            .leftMiddle = updated.leftMiddle,
            .leftDown = updated.leftDown,
            .rightUp = updated.rightUp,
            .rightMiddle = updated.rightMiddle,
            .rightDown = updated.rightDown,
            .mute = updated.mute,
            .voiceAssistant = updated.voiceAssistant,
            .acceptCall = updated.acceptCall,
            .endCall = updated.endCall,
            .lastChange = millis()};
        sendSteeringWheelControls();
    }
}

void sendSteeringWheelControls()
{
    Serial1.print("SWC|");
    printBool(currentState.steeringWheelControls.leftUp, true);
    printBool(currentState.steeringWheelControls.leftMiddle, true);
    printBool(currentState.steeringWheelControls.leftDown, true);
    printBool(currentState.steeringWheelControls.rightUp, true);
    printBool(currentState.steeringWheelControls.rightMiddle, true);
    printBool(currentState.steeringWheelControls.rightDown, true);
    printBool(currentState.steeringWheelControls.mute, true);
    printBool(currentState.steeringWheelControls.voiceAssistant, true);
    printBool(currentState.steeringWheelControls.acceptCall, true);
    printBool(currentState.steeringWheelControls.endCall, false);
    Serial1.println();

    // TODO: improve commands
    if (currentState.steeringWheelControls.leftUp)
        mediaPrevious();
    if (currentState.steeringWheelControls.leftMiddle || currentState.steeringWheelControls.rightMiddle)
        mediaPlayPause();
    if (currentState.steeringWheelControls.leftDown)
        mediaNext();
    if (currentState.steeringWheelControls.rightUp)
        volumeUp();
    if (currentState.steeringWheelControls.rightDown)
        volumeDown();
    if (currentState.steeringWheelControls.mute)
        mute();
    if (currentState.steeringWheelControls.voiceAssistant)
        openAssistant();
    if (currentState.steeringWheelControls.acceptCall)
        openHome();
    if (currentState.steeringWheelControls.endCall)
        openHome();
}

void updateLights(Lights updated)
{
    Lights state = currentState.lights;

    bool hasChanges =
        state.highBeam != updated.highBeam ||
        state.lowBeam != updated.lowBeam ||
        state.brake != updated.brake ||
        state.leftTurnSignal != updated.leftTurnSignal ||
        state.rightTurnSignal != updated.rightTurnSignal;

    if (hasChanges)
    {
        currentState.lights = updated;
    }
}

void sendLights()
{
    Serial1.print("L|");
    printBool(currentState.lights.highBeam, true);
    printBool(currentState.lights.lowBeam, true);
    printBool(currentState.lights.brake, true);
    printBool(currentState.lights.leftTurnSignal, true);
    printBool(currentState.lights.rightTurnSignal, false);
    Serial1.println();
}

void updateDoors(Doors updated)
{
    Doors state = currentState.doors;
    bool hasChanges =
        state.driver != updated.driver ||
        state.passenger != updated.passenger ||
        state.trunk != updated.trunk;
    if (hasChanges)
    {
        currentState.doors = updated;
        sendDoors();
    }
}

void sendDoors()
{
    Serial1.print("D|");
    printBool(currentState.doors.driver, true);
    printBool(currentState.doors.passenger, true);
    printBool(currentState.doors.trunk, false);
    Serial1.println();
}

void updateTransmission(Transmission updated)
{
    Transmission state = currentState.transmision;

    bool hasChanges =
        state.manual != updated.manual ||
        state.gear != updated.gear;
    if (hasChanges)
    {
        currentState.transmision = updated;
        sendTransmission();
    }
}

void sendTransmission()
{
    Serial1.print("T|");
    printBool(currentState.transmision.manual, true);
    Serial1.println(currentState.transmision.gear);
}
