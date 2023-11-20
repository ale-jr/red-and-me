#include "debug.h"
#include <Arduino.h>
#include <keyboard.h>

#define NO_DEBUG 0
#define DEBUG_BY_ID 1

#define MAX_IDS 100
short debugMode;
int selectedIndex;
long unsigned int discoveredIds[MAX_IDS] = {};

void printIds()
{
    debugMode = NO_DEBUG;
    Serial.println("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n Found IDs:");
    for (int i = 0; i < MAX_IDS; i++)
    {
        long unsigned int id = discoveredIds[i];
        if (id > 0)
        {
            Serial.print("#");
            Serial.print(i);
            Serial.print(" - ");
            Serial.println(id);
        }
    }
    Serial.print("Enter index to filter");
}

void filterMessageById(long unsigned int id)
{
    int index = -1;
    for (int i = 0; i < MAX_IDS; i++)
    {
        if (discoveredIds[i] == id)
        {
            index = i;
            break;
        }
    }

    debugMode = DEBUG_BY_ID;

    if (index > -1)
    {

        selectedIndex = index;
        Serial.print("Filtering by id: ");
        Serial.println(index);
    }
    else
    {
        Serial.println("id not found");
    }
}

void stopFilterMessages()
{
    debugMode = NO_DEBUG;
    selectedIndex = -1;
    Serial.print("Stopped filtering");
}

void handleId(long unsigned int id)
{
    for (int i = 0; i < MAX_IDS; i++)
    {
        if (discoveredIds[i] == id)
        {
            return;
        }
        else if (discoveredIds[i] == 0)
        {
            discoveredIds[i] = id;
            return;
        }
    }
}

void printMessage(long unsigned int id, unsigned char length, unsigned char buffer[])
{
    Serial.print("ID: ");
    Serial.print(id);
    Serial.print(" len: ");
    Serial.print(length);
    Serial.print(" data: ");
    for (int i = 0; i < length; i++)
    {
        Serial.print(buffer[i]);
        Serial.print(",");
    }
    Serial.println();
}

int getDebugMode()
{
    return debugMode;
}

int getSelectedIndex()
{
    return selectedIndex;
}

long unsigned int *getDiscoveredIds()
{
    return discoveredIds;
}

void debugLoop()
{
    bool shouldDebug = Serial.available() > 0;
    if (!shouldDebug)
        return;

    String command = Serial.readStringUntil('\n');

    Serial.println("Command" + command);
    if (command.equals("ids"))
    {
        printIds();
    }
    else if (command.equals("stop"))
    {
        stopFilterMessages();
    }
    else if (command.equals("volUp"))
    {
        volumeUp();
    }
    else if (command.equals("volDown"))
    {
        volumeUp();
    }
    else if (command.equals("playPause"))
    {
        mediaPlayPause();
    }
    else if (command.equals("previous"))
    {
        mediaPrevious();
    }
    else if (command.equals("next"))
    {
        mediaNext();
    }
    else if (command.equals("home"))
    {
        openHome();
    }
    else if (command.equals("isDeviceConnected"))
    {
        Serial.print("isDeviceConnected: ");
        Serial.println(isDeviceConnected() ? "true": "false");
    }
    else
    {
        unsigned long int id = strtoul(command.c_str(), NULL, 10);
        filterMessageById(id);
    }
}
