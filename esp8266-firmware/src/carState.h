#pragma once
typedef struct {
    bool leftUp;
    bool leftMiddle;
    bool leftDown;
    bool rightUp;
    bool rightMiddle;
    bool rightDown;
    bool mute;
    bool voiceAssistant;
    bool acceptCall;
    bool endCall;
    unsigned long lastChange;
} SteeringWheelControls;

typedef struct {
    bool highBeam;
    bool lowBeam;
    bool brake;
    bool leftTurnSignal;
    bool rightTurnSignal;
    unsigned long lastChange;
} Lights;

typedef struct {
    bool driver;
    bool passenger;
    bool trunk;
    unsigned long lastChange;
} Doors;


typedef struct {
    bool manual;
    short int gear;
    unsigned long lastChange;
} Transmission;

typedef struct {
    SteeringWheelControls steeringWheelControls;
    Lights lights;
    Doors doors;
    Transmission transmision;
} State;


void updateSteeringwheelControls(SteeringWheelControls steeringWheelControls);

void updateLights(Lights lighs);

void updateDoors(Doors doors);

void updateTransmission(Transmission transmission);

void sendSteeringWheelControls();
void sendLights();
void sendDoors();
void sendTransmission();