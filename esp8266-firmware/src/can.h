#pragma once
typedef struct
{
   long unsigned int id;
   unsigned char length;
   unsigned char buffer[];
} CanMessage;


void setupCan();

void canLoop();

void handleMessage(CanMessage message);
void handleMessageInDebugMode(CanMessage message);