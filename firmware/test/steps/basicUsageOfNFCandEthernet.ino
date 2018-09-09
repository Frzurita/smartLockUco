#include <Arduino.h>

// Event handler library
#include <EventManager.h>

// NFC library
#include <PN532.h>

// Ethernet libraries
#include <SPI.h>
#include <Ethernet.h>

// Helpers
#include <String.h>

// Setting NFC shield params
#define SCK         7
#define MOSI        6
#define SS          10
#define MISO        2

// Initialiting NFC library
PN532 nfc(SCK, MISO, MOSI, SS);

// Enter a MAC address for your controller below.
byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
// IPAddress
char server[] = "192.168.1.131";

// Set the static IP address to use if the DHCP fails to assign
IPAddress ip(192, 168, 1, 131);

// Initialize the Ethernet client library
EthernetClient client;

// Initialize the EventManager library
EventManager gEM;

// Setting all variables
int ledPin = 8; // Red led
int ledPin1 = 12; // Green led
int inPin = 2; // pin 2 asignado para el pulsador
String message;
bool isReadyToRead = false;

void tarjectDetectionQueue()
{
    gEM.queueEvent( EventManager::kEventUser0, HIGH);
}

// Our listener will simply toggle the state of pin 13
void tarjectDetection( int event, int param )
{
    digitalWrite(ledPin, HIGH);
    Serial.println("NFC card readed");
    delay(500);
    Serial.println("NFC cart sent");
    isReadyToRead = true;
     if (client.connect(server, 3500)) {
      Serial.println("connected");
      client.println("GET /api/auth/login?arduino=true HTTP/1.1");
      client.println("Host: www.google.com");
      client.println("Connection: close");
      client.println();
    } else {
      Serial.println("Connection failed");
      client.stop();
    }
    digitalWrite(ledPin, LOW);
}

void getConfirmationFromServer( int event, int param )
{
    int initialIndex = message.indexOf("/W");
    int finalIndex = message.lastIndexOf("/W");
    String cadena = message.substring(initialIndex + 2, finalIndex);
    Serial.println(cadena);
    Serial.println();
    client.stop();
    Serial.println(cadena);
    if(cadena == "success"){
        Serial.println("Success!!");
        //ledSuccessQueue();
        digitalWrite(ledPin1, HIGH);
        delay(500);
        digitalWrite(ledPin1, LOW);
        delay(500);
        digitalWrite(ledPin1, HIGH);
        delay(500);
        digitalWrite(ledPin1, LOW);
        delay(500);
        Serial.println("Sequence finished");
    }
    else{
        //ledFailedQueue();
        Serial.println("Failed..");
        digitalWrite(ledPin, HIGH);
        delay(500);
        digitalWrite(ledPin, LOW);
        delay(500);
        digitalWrite(ledPin, HIGH);
        delay(500);
        digitalWrite(ledPin, LOW);
        delay(500);
    }
    message = "";
}

void setup()
{
    // Open serial monitor communication channel
    Serial.begin(9600);

    // Initialize nfc
    nfc.begin();
    nfc.SAMConfig();

    // start the Ethernet connection:
    if (Ethernet.begin(mac) == 0) {
      Serial.println("Failed to configure Ethernet using DHCP");
      // try to congifure using IP address instead of DHCP:
      Ethernet.begin(mac, ip);
    }

    // give the Ethernet shield a second to initialize:
    delay(1000);
    Serial.println("connecting...");

    Serial.println("Placa preparada para leer!");
    // Setup
    pinMode( inPin, INPUT );
    pinMode( ledPin, OUTPUT );
    // Add our listener
    gEM.addListener( EventManager::kEventUser0, tarjectDetection );
    gEM.addListener( EventManager::kEventUser1,  getConfirmationFromServer );
}

void loop()
{
    // Handle any events that are in the queue
    gEM.processEvent();

    uint32_t id = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A);
    if(id != 0){
        Serial.println(id);
        tarjectDetectionQueue();
    }
  // if there are incoming bytes available
  // from the server, read them and print them:
  while (client.available()) {
    char c = client.read();
    message += c;
  }

  // if the server's disconnected, stop the client:
  if (!client.connected() and isReadyToRead == true) {
    isReadyToRead = false;
    getConfirmationFromServerQueue();
  }
}


void getConfirmationFromServerQueue(){
    gEM.queueEvent( EventManager::kEventUser1, HIGH);
}