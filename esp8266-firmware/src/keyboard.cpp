#include "keyboard.h"
#include <Arduino.h>
#include <BleKeyboard.h>

BleKeyboard bleKeyboard("red-and-me");

void setupKeyboard()
{
    bleKeyboard.begin();
}

bool hasSentFirstCommand = false;
void keyboardLoop()
{
    if (bleKeyboard.isConnected() && hasSentFirstCommand == false)
    {
        hasSentFirstCommand = true;
        delay(1000);
        //mediaPlayPause();
    }
}

void mediaPlayPause()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_PLAY_PAUSE);
}

void mediaNext()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_NEXT_TRACK);
}

void mediaPrevious()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_PREVIOUS_TRACK);
}

void volumeUp()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_VOLUME_UP);
}

void volumeDown()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_VOLUME_DOWN);
}

void openHome()
{
    if (bleKeyboard.isConnected())
        bleKeyboard.write(KEY_MEDIA_WWW_HOME);
}

void openAssistant()
{
    openHome();
    delay(800);
    bleKeyboard.write(KEY_F9);
}

void openParkAssist()
{
    openHome();
    delay(800);
    bleKeyboard.write(KEY_F2);
}

void mute()
{
    bleKeyboard.write(KEY_MEDIA_MUTE);
}

bool isDeviceConnected()
{
    return bleKeyboard.isConnected();
}
