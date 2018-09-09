#include <Arduino.h>

// Event handler library
#include <EventManager.h>

// NFC library
#include <PN532.h>

// Ethernet libraries
#include <Ethernet.h>

// Helpers
#include <String.h>

// Setting NFC shield params
#define SCK         7
#define MOSI        6
#define SS          10
#define MISO        2

// Initializing NFC library
PN532 nfc(SCK, MISO, MOSI, SS);

// Initialize the Ethernet client library
EthernetClient client;

// Initialize the EventManager library
EventManager gEM;

// It will be the key we will need to read the card Id
uint8_t CARD_KEY [] = { 0xFF,0xFF,0xFF,0xFF,0xFF,0xFF };

// Initializing id to store the NFC public id.
uint32_t id;

// We will need to init the lock with the id stored in data base
String lockId = "5b89c01fa3a53a068849d0da";

// Enter a MAC address for your controller below.
byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};

// IPAddress
char server[] = "192.168.1.131";

// Set the static IP address to use if the DHCP fails to assign
IPAddress ip(192, 168, 1, 142);

// Setting all variables
int redPin = 8; // Red led
int greenPin = 9; // Green led
int doorPin = 11; // lock relay
String message;
bool isReadyToRead = false;

// Our listener will simply toggle the state of pin 13
void tarjectDetection( int event, int params ) {

    // Checking if we have the correct credentials to have read rights
    if( !nfc.authenticateBlock (1, id, 4, KEY_A, CARD_KEY) ) return;
               
    uint8_t block[16]; 
     
    // Reading the block number 4. Where we will store the card Id
    if (!nfc.readMemoryBlock (1, 4, block) ) return;

    // Building HTTP headers
    String card = String();
    String lock = String();
    String cardId = String();
    for (int i = 0; i < 16 ; i++) {
      cardId += block[i];  
    }
    card = "nfcCredentials: " + cardId;
    lock = "lockId: " + lockId;
    
    // Serial.println(card);
    digitalWrite(greenPin, HIGH);
    // Serial.println("NFC card readed");
    // Serial.println("NFC cart sent");
    isReadyToRead = true;
     if (client.connect(server, 3500)) {
      Serial.println("connected");
      client.println("POST /api/public/lock/check HTTP/1.1");
      client.println("Connection: close");
      client.println(card);
      client.println(lock);
      client.println();
    } else {
      // Serial.println("Connection failed");
      client.stop();
    }
    digitalWrite(greenPin, LOW);
}

void getConfirmationFromServer( int event, int param ) {
    // First it has to filter the response from server
    int initialIndex = message.indexOf("/W");
    int finalIndex = message.lastIndexOf("/W");
    String cadena = message.substring(initialIndex + 2, finalIndex);

    
    // Serial.println(cadena);
    // Serial.println();
    client.stop();
    // Serial.println(cadena);

    // Sequence to handle the green led and lock pin when the access is success
    if(cadena == "success"){
        Serial.println("Success!!");
        //ledSuccessQueue();
        digitalWrite(doorPin, LOW);
        digitalWrite(greenPin, HIGH);
        delay(500);
        digitalWrite(greenPin, LOW);
        delay(500);
        digitalWrite(greenPin, HIGH);
        delay(500);
        digitalWrite(greenPin, LOW);
        delay(2500);
        digitalWrite(doorPin, HIGH);
    }
    // Sequence to handle the reed led when the access has failed
    else{
        //ledFailedQueue();
        Serial.println("Failed..");
        digitalWrite(redPin, HIGH);
        delay(500);
        digitalWrite(redPin, LOW);
        delay(500);
        digitalWrite(redPin, HIGH);
        delay(500);
        digitalWrite(redPin, LOW);
        delay(500);
    }
    message = "";
}

void setup()
{
    // Open serial monitor communication channel
    // Serial.begin(9600);

    // Initialize nfc
    nfc.begin();
    nfc.SAMConfig();

    // start the Ethernet connection:
    if (Ethernet.begin(mac) == 0) {
      // Serial.println("Failed to configure Ethernet using DHCP");
      // try to congifure using IP address instead of DHCP:
      Ethernet.begin(mac, ip);
    }

    // give the Ethernet shield a second to initialize:
    delay(1000);
    // Serial.println("connecting...");

    // Serial.println("Placa preparada para leer!");
    // Setup
    pinMode( redPin, OUTPUT );
    pinMode( greenPin, OUTPUT );
    pinMode( doorPin, OUTPUT );
    // Add our listener
    gEM.addListener( EventManager::kEventUser0, tarjectDetection );
    gEM.addListener( EventManager::kEventUser1,  getConfirmationFromServer );
}

void loop()
{
    // Handle any events that are in the queue
    gEM.processEvent();

    id = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A);
    if(id != 0){
        Serial.println(id);
        tarjectDetectionQueue();
    }
  // if there are incoming bytes available
  // from the server, store them in message
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

void tarjectDetectionQueue() {
    gEM.queueEvent( EventManager::kEventUser0, HIGH);
}