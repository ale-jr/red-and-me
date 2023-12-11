#pragma once

void setupCan();

void canLoop();

void handleMessage(unsigned long id, unsigned char length, unsigned char buffer[12]);
void handleMessageInDebugMode(unsigned long id, unsigned char length, unsigned char buffer[12]);