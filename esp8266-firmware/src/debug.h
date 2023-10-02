#pragma once

void printIds();

void filterMessageById(long unsigned int id);

void handleId(long unsigned int id);

void printMessage(long unsigned int id, unsigned char length, unsigned char buffer[]);

int getDebugMode();

int getSelectedIndex();

long unsigned int* getDiscoveredIds();


void debugLoop();