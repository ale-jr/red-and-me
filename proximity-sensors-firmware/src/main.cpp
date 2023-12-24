#include <Arduino.h>
#include "Adafruit_VL53L0X.h"

// address we will assign if dual sensor is present
#define LOX1_ADDRESS 0x30
#define LOX2_ADDRESS 0x31
#define LOX3_ADDRESS 0x34

// set the pins to shutdown
#define SHT_LOX1 12
#define SHT_LOX2 13
#define SHT_LOX3 14

// objects for the vl53l0x
Adafruit_VL53L0X lox1 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox2 = Adafruit_VL53L0X();
Adafruit_VL53L0X lox3 = Adafruit_VL53L0X();

// this holds the measurement
VL53L0X_RangingMeasurementData_t measure1;
VL53L0X_RangingMeasurementData_t measure2;
VL53L0X_RangingMeasurementData_t measure3;

/*
    Reset all sensors by setting all of their XSHUT pins low for delay(10), then set all XSHUT high to bring out of reset
    Keep sensor #1 awake by keeping XSHUT pin high
    Put all other sensors into shutdown by pulling XSHUT pins low
    Initialize sensor #1 with lox.begin(new_i2c_address) Pick any number but 0x29 and it must be under 0x7F. Going with 0x30 to 0x3F is probably OK.
    Keep sensor #1 awake, and now bring sensor #2 out of reset by setting its XSHUT pin high.
    Initialize sensor #2 with lox.begin(new_i2c_address) Pick any number but 0x29 and whatever you set the first sensor to
 */
void setID()
{
  // all reset
  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);

  delay(100);
  // all unreset
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, HIGH);
  digitalWrite(SHT_LOX3, HIGH);
  delay(100);

  // activating LOX1 and resetting LOX2
  digitalWrite(SHT_LOX1, HIGH);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);

  delay(100);

  // initing LOX1
  if (!lox1.begin(LOX1_ADDRESS))
  {
    Serial.println(F("Failed to boot first VL53L0X"));
    while (1)
      ;
  }
  delay(100);

  // activating LOX2
  digitalWrite(SHT_LOX2, HIGH);
  delay(100);

  // initing LOX2
  if (!lox2.begin(LOX2_ADDRESS))
  {
    Serial.println(F("Failed to boot second VL53L0X"));
    while (1)
      ;
  }

  // activating LOX3
  digitalWrite(SHT_LOX3, HIGH);
  delay(100);

  // initing LOX3
  if (!lox3.begin())
  {
    Serial.println(F("Failed to boot third VL53L0X"));
    while (1)
      ;
  }
}

void read_dual_sensors()
{

  lox1.rangingTest(&measure1, false); // pass in 'true' to get debug data printout!
  lox2.rangingTest(&measure2, false); // pass in 'true' to get debug data printout!
  lox3.rangingTest(&measure3, false); // pass in 'true' to get debug data printout!

  int rangeFrontLeft = 999;
  int rangeFrontMiddle = 999;
  int rangeFrontRight = 999;

  int rangeRearLeft = measure1.RangeStatus != 4 ? measure1.RangeMilliMeter / 10 : 999;
  int rangeRearMiddle = measure2.RangeStatus != 4 ? measure2.RangeMilliMeter / 10 : 999;
  int rangeRearRight = measure3.RangeStatus != 4 ? measure3.RangeMilliMeter / 10 : 999;

  Serial.print(rangeFrontLeft);
  Serial.print(',');
  Serial.print(rangeFrontMiddle);
  Serial.print(',');
  Serial.print(rangeFrontRight);
  Serial.print(',');
  Serial.print(rangeRearLeft);
  Serial.print(',');
  Serial.print(rangeRearMiddle);
  Serial.print(',');
  Serial.print(rangeRearRight);
  Serial.println();
  delay(200);
}

void setup()
{
  Serial.begin(9600);

  // wait until serial port opens for native USB devices
  while (!Serial)
  {
    delay(1);
  }

  pinMode(SHT_LOX1, OUTPUT);
  pinMode(SHT_LOX2, OUTPUT);
  pinMode(SHT_LOX3, OUTPUT);

  Serial.println(F("Shutdown pins inited..."));

  digitalWrite(SHT_LOX1, LOW);
  digitalWrite(SHT_LOX2, LOW);
  digitalWrite(SHT_LOX3, LOW);

  Serial.println(F("Both in reset mode...(pins are low)"));

  Serial.println(F("Starting..."));
  setID();
}

void loop()
{

  read_dual_sensors();
  delay(100);
}