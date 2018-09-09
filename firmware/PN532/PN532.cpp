// PN532 library by adafruit/ladyada
// MIT license

// authenticateBlock, readMemoryBlock, writeMemoryBlock contributed
// by Seeed Technology Inc (www.seeedstudio.com)

// Modificada por giltesa.com para:
// - Añadir compatibilidad con el IDE 1.x
// - Añadir documentacion.
// - Arreglar errores del modo debugger.
// - Añadir metodos readAllMemory y writeAllMemory.
// - Ordenar el codigo.


#include "PN532.h"

//#define PN532DEBUG 1

byte pn532ack[] = {0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00};
byte pn532response_firmwarevers[] = {0x00, 0xFF, 0x06, 0xFA, 0xD5, 0x03};

#define PN532_PACKBUFFSIZ 64
byte pn532_packetbuffer[PN532_PACKBUFFSIZ];


/**
 *
 */
PN532::PN532(uint8_t clk, uint8_t miso, uint8_t mosi, uint8_t ss)
{
	_clk  = clk;
	_miso = miso;
	_mosi = mosi;
	_ss   = ss;

	pinMode(_ss, OUTPUT);
	pinMode(_clk, OUTPUT);
	pinMode(_mosi, OUTPUT);
	pinMode(_miso, INPUT);
}


/**
 *
 */
void PN532::begin()
{
	digitalWrite(_ss, LOW);

	delay(1000);

	// not exactly sure why but we have to send a dummy command to get synced up
	pn532_packetbuffer[0] = PN532_FIRMWAREVERSION;
	sendCommandCheckAck(pn532_packetbuffer, 1);

	// ignore response!
}


/**
 *
 */
uint32_t PN532::getFirmwareVersion(void)
{
	uint32_t response;

	pn532_packetbuffer[0] = PN532_FIRMWAREVERSION;

	if( !sendCommandCheckAck(pn532_packetbuffer, 1) )
		return 0;

	// read data packet
	readspidata(pn532_packetbuffer, 12);
	// check some basic stuff
	if( 0 != strncmp((char *)pn532_packetbuffer, (char *)pn532response_firmwarevers, 6))
		return 0;

	response = pn532_packetbuffer[6];
	response <<= 8;
	response |= pn532_packetbuffer[7];
	response <<= 8;
	response |= pn532_packetbuffer[8];
	response <<= 8;
	response |= pn532_packetbuffer[9];

	return response;
}


/**
 *
 */
boolean PN532::sendCommandCheckAck(uint8_t *cmd, uint8_t cmdlen, uint16_t timeout)
{
	uint16_t timer = 0;

	// write the command
	spiwritecommand(cmd, cmdlen);

	// Wait for chip to say its ready!
	while( readspistatus() != PN532_SPI_READY )
	{
		if( timeout != 0 )
		{
			timer+=10;
			if( timer > timeout )
				return false;
		}
		delay(10);
	}

	// read acknowledgement
	if( !spi_readack() )
		return false;

	timer = 0;
	// Wait for chip to say its ready!
	while( readspistatus() != PN532_SPI_READY )
	{
		if( timeout != 0 )
		{
			timer+=10;
			if( timer > timeout )
				return false;
		}
		delay(10);
	}

	return true; // ack'd command
}


/**
 * This API invokes the SAMConfiguration command of PN532 and sets
 * it to Normal Mode. SAM stands for Security Access Module
 * (i.e the PN532 system). PN532 system can work in Normal mode,
 * Virtual Card mode, Wired Card mode and Dual Card mode.
 */
boolean PN532::SAMConfig(void)
{
	pn532_packetbuffer[0] = PN532_SAMCONFIGURATION;
	pn532_packetbuffer[1] = 0x01; // normal mode;
	pn532_packetbuffer[2] = 0x14; // timeout 50ms * 20 = 1 second
	pn532_packetbuffer[3] = 0x01; // use IRQ pin!

	if( !sendCommandCheckAck(pn532_packetbuffer, 4) )
		return false;

	// read data packet
	readspidata(pn532_packetbuffer, 8);

	return (pn532_packetbuffer[5] == 0x15);
}


/**
 * This method is used to authenticate a memory block with key before
 * read/write operation. Returns true when successful. 
 * - cardnumber can be 1 or 2 
 * - cid is 32-bit Card ID 
 * - blockaddress is block number (any number between 0 - 63 for MIFARE card) 
 * - authtype is which key is to be used for authentication (either KEY_A or KEY_B) 
 * - keys points to the byte-array holding 6 keys. 
 */
uint32_t PN532::authenticateBlock( uint8_t cardnumber, uint32_t cid, uint8_t blockaddress, uint8_t authtype, uint8_t *keys )
{
	pn532_packetbuffer[0] = PN532_INDATAEXCHANGE;
	pn532_packetbuffer[1] = cardnumber;  // either card 1 or 2 (tested for card 1)

	if( authtype == KEY_A )
		pn532_packetbuffer[2] = PN532_AUTH_WITH_KEYA;
	else
		pn532_packetbuffer[2] = PN532_AUTH_WITH_KEYB;

	pn532_packetbuffer[3] = blockaddress; //This address can be 0-63 for MIFARE 1K card

	pn532_packetbuffer[4] = keys[0];
	pn532_packetbuffer[5] = keys[1];
	pn532_packetbuffer[6] = keys[2];
	pn532_packetbuffer[7] = keys[3];
	pn532_packetbuffer[8] = keys[4];
	pn532_packetbuffer[9] = keys[5];

	pn532_packetbuffer[10] = ((cid >> 24) & 0xFF);
	pn532_packetbuffer[11] = ((cid >> 16) & 0xFF);
	pn532_packetbuffer[12] = ((cid >> 8) & 0xFF);
	pn532_packetbuffer[13] = ((cid >> 0) & 0xFF);

	if( !sendCommandCheckAck(pn532_packetbuffer, 14) )
		return false;

	// read data packet
	readspidata(pn532_packetbuffer, 2+6);

	#ifdef PN532DEBUG
	for( int iter=0 ; iter<14 ; iter++ )
	{
		Serial.print(pn532_packetbuffer[iter], HEX);
		Serial.print(" ");
	}
	Serial.println();
	// check some basic stuff

	Serial.println("AUTH");
	for( uint8_t i=0 ; i<2+6 ; i++ )
	{
		Serial.print(pn532_packetbuffer[i], HEX); Serial.println(" ");
	}
	#endif

	if( (pn532_packetbuffer[6] == 0x41) && (pn532_packetbuffer[7] == 0x00) )
		return true;
	else
		return false;
}


/**
 * This method reads a memory block after authentication with the key.
 * Returns true when successful. 
 * - cardnumber can be 1 or 2 
 * - blockaddress is block number (any number between 0 - 63 for MIFARE card)
 *   to read. Each block is 16bytes long in case of MIFARE Standard card. 
 * - block points to buffer(byte-array)to hold 16 bytes of block-data. 
*/
uint32_t PN532::readMemoryBlock( uint8_t cardnumber, uint8_t blockaddress, uint8_t *block )
{
	pn532_packetbuffer[0] = PN532_INDATAEXCHANGE;
	pn532_packetbuffer[1] = cardnumber;  // either card 1 or 2 (tested for card 1)
	pn532_packetbuffer[2] = PN532_MIFARE_READ;
	pn532_packetbuffer[3] = blockaddress; //This address can be 0-63 for MIFARE 1K card

	if( ! sendCommandCheckAck(pn532_packetbuffer, 4) )
		return false;

	// read data packet
	readspidata(pn532_packetbuffer, 18+6);
	// check some basic stuff
	#ifdef PN532DEBUG
	Serial.println("READ");
	#endif
	for( uint8_t i=8 ; i<18+6 ; i++)
	{
		block[i-8] = pn532_packetbuffer[i];
		#ifdef PN532DEBUG
			Serial.print(pn532_packetbuffer[i], HEX); Serial.print(" ");
		#endif
	}

	if( (pn532_packetbuffer[6] == 0x41) && (pn532_packetbuffer[7] == 0x00) )
		return true; //read successful
	else
		return false;
}


/**
 * This method writes data to a memory block after authentication with the key.
 * Returns true when successful. 
 * - cardnumber can be 1 or 2 
 * - blockaddress is block number (any number between 0 - 63 for MIFARE card) to write.
 *   Each block is 16bytes long in case of MIFARE Standard card. 
 * - block points to buffer(byte-array) which holds 16 bytes of block-data to write.
 */
uint32_t PN532::writeMemoryBlock( uint8_t cardnumber, uint8_t blockaddress, uint8_t *block )
{
	pn532_packetbuffer[0] = PN532_INDATAEXCHANGE;
	pn532_packetbuffer[1] = cardnumber;  // either card 1 or 2 (tested for card 1)
	pn532_packetbuffer[2] = PN532_MIFARE_WRITE;
	pn532_packetbuffer[3] = blockaddress;

	for( uint8_t byte=0 ; byte<16 ; byte++ )
	{
		pn532_packetbuffer[4+byte] = block[byte];
	}

	if( !sendCommandCheckAck(pn532_packetbuffer, 20) )
		return false;

	// read data packet
	readspidata(pn532_packetbuffer, 2+6);

	#ifdef PN532DEBUG
		// check some basic stuff
		Serial.println("WRITE");
		for( uint8_t i=0 ; i<2+6 ; i++ )
		{
			Serial.print(pn532_packetbuffer[i], HEX); Serial.println(" ");
		}
	#endif

	if( (pn532_packetbuffer[6] == 0x41) && (pn532_packetbuffer[7] == 0x00) )
		return true; //write successful
	else
		return false;
}


 /**
  * Este metodo lee todos los sectores y bloques de memoria consecutivos necesarios para
  * llenar la variable "data".
  * Se recomienda usar una estructura UNION con una estructura STRUCT en su interior
  * con las variables que sean necesarias.
  *
  * - cid      ID del dispositivo NFC
  * - data     Donde se almacenaran los datos a devolver. Entre 1 y 752 bytes para dispositivos NFC de 1KiB compatibles con mifare.
  * - sizeData Tamania de los datos a devolver.
  */
uint32_t PN532::readAllMemory( uint32_t cid, uint8_t *data, uint32_t sizeData )
{
	uint8_t  keys[]  = {0xFF,0xFF,0xFF,0xFF,0xFF,0xFF};
	uint32_t posData = 0;
	uint8_t  buffer[16];	


	// Iterates through all the memory:
	for( uint8_t address=0x02 ; address<=0x3F && posData<sizeData ; address++ )
	{
		// Read only Data Block:
		if( address % 4 )
		{
			if( !authenticateBlock(1, cid, address-1, KEY_A, keys) )
				return false;
			else
			{
				if( !readMemoryBlock(1, address-1, buffer) )
					return false;

				for( uint8_t posBuffer=0 ; posData<sizeData && posBuffer<16 ; posBuffer++ )
					data[posData++] = buffer[posBuffer];
			}
		}

	}

	return true;
}


 /**
  * Este metodo escribe todos los sectores y bloques de memoria consecutivos necesarios para
  * almacenar la variable "data".
  * Se recomienda usar una estructura UNION con una estructura STRUCT en su interior
  * con las variables que sean necesarias.
  *
  * - cid      ID del dispositivo NFC
  * - data     Donde se almacenaran los datos a devolver. Entre 1 y 752 bytes para dispositivos NFC de 1KiB compatibles con mifare.
  * - sizeData Tamania de los datos a devolver.
  */
uint32_t PN532::writeAllMemory( uint32_t cid, uint8_t *data, uint32_t sizeData )
{
	uint8_t  keys[]  = {0xFF,0xFF,0xFF,0xFF,0xFF,0xFF};
	uint32_t posData = 0;
	uint8_t  buffer[16];	


	// Iterates through all the memory:
	for( uint8_t address=0x02 ; address<=0x3F && posData<sizeData ; address++ )
	{
		// Write only Data Block:
		if( address % 4 )
		{
			if( !authenticateBlock(1, cid, address-1, KEY_A, keys) )
				return false;
			else
			{
				for( uint8_t posBuffer=0 ; posData<sizeData && posBuffer<16 ; posBuffer++ )
					buffer[posBuffer] = data[posData++];

				if( !writeMemoryBlock(1, address-1, buffer) )
					return false;
			}
		}

	}

	return true;
}


/**
 * This method reads the Passive Target ID and returns it as a 32-bit number.
 * At the moment only reading MIFARE ISO14443A cards/tags are supported.
 * Hence use PN532_MIFARE_ISO14443A as parameter. Returns 32 bit card number
 */
uint32_t PN532::readPassiveTargetID(uint8_t cardbaudrate)
{
	uint32_t cid;

	pn532_packetbuffer[0] = PN532_INLISTPASSIVETARGET;
	pn532_packetbuffer[1] = 1;  // max 1 cards at once (we can set this to 2 later)
	pn532_packetbuffer[2] = cardbaudrate;

	if( !sendCommandCheckAck(pn532_packetbuffer, 3) )
		return 0x0;  // no cards read

	// read data packet
	readspidata(pn532_packetbuffer, 20);
	// check some basic stuff

	#ifdef PN532DEBUG
		Serial.print("Found "); Serial.print(pn532_packetbuffer[7], DEC); Serial.println(" tags");
	#endif

	if (pn532_packetbuffer[7] != 1)
		return 0;

	uint16_t sens_res = pn532_packetbuffer[9];
	sens_res <<= 8;
	sens_res |= pn532_packetbuffer[10];

	#ifdef PN532DEBUG
		Serial.print("Sens Response: 0x");  Serial.println(sens_res, HEX);
		Serial.print("Sel Response: 0x");  Serial.println(pn532_packetbuffer[11], HEX);
	#endif

	cid = 0;
	for( uint8_t i=0 ; i< pn532_packetbuffer[12] ; i++ )
	{
		cid <<= 8;
		cid |= pn532_packetbuffer[13+i];
		#ifdef PN532DEBUG
			Serial.print(" 0x"); Serial.print(pn532_packetbuffer[13+i], HEX);
		#endif
	}

	#ifdef PN532DEBUG
		Serial.println("TargetID");
		for( uint8_t i=0 ; i<20 ; i++ )
		{
			Serial.print(pn532_packetbuffer[i], HEX); Serial.println(" ");
		}
	#endif
	return cid;
}


/************** high level SPI */


/**
 *
 */
boolean PN532::spi_readack()
{
	uint8_t ackbuff[6];

	readspidata(ackbuff, 6);

	return (0 == strncmp((char *)ackbuff, (char *)pn532ack, 6));
}

/************** mid level SPI */

uint8_t PN532::readspistatus(void)
{
	digitalWrite(_ss, LOW);
	delay(2);
	spiwrite(PN532_SPI_STATREAD);
	// read byte
	uint8_t x = spiread();

	digitalWrite(_ss, HIGH);
	return x;
}


/**
 *
 */
void PN532::readspidata(uint8_t* buff, uint8_t n)
{
	digitalWrite(_ss, LOW);
	delay(2);
	spiwrite(PN532_SPI_DATAREAD);

	#ifdef PN532DEBUG
	Serial.print("Reading: ");
	#endif
	for( uint8_t i=0 ; i<n ; i++ )
	{
		delay(1);
		buff[i] = spiread();
		#ifdef PN532DEBUG
			Serial.print(" 0x");
			Serial.print(buff[i], HEX);
		#endif
	}

	#ifdef PN532DEBUG
	Serial.println();
	#endif

	digitalWrite(_ss, HIGH);
}


/**
 *
 */
void PN532::spiwritecommand(uint8_t* cmd, uint8_t cmdlen)
{
	uint8_t checksum;

	cmdlen++;

	#ifdef PN532DEBUG
		Serial.print("\nSending: ");
	#endif

	digitalWrite(_ss, LOW);
	delay(2);     // or whatever the delay is for waking up the board
	spiwrite(PN532_SPI_DATAWRITE);

	checksum = PN532_PREAMBLE + PN532_PREAMBLE + PN532_STARTCODE2;
	spiwrite(PN532_PREAMBLE);
	spiwrite(PN532_PREAMBLE);
	spiwrite(PN532_STARTCODE2);

	spiwrite(cmdlen);
	uint8_t cmdlen_1=~cmdlen + 1;
	spiwrite(cmdlen_1);

	spiwrite(PN532_HOSTTOPN532);
	checksum += PN532_HOSTTOPN532;

	#ifdef PN532DEBUG
	Serial.print(" 0x"); Serial.print(PN532_PREAMBLE, HEX);
	Serial.print(" 0x"); Serial.print(PN532_PREAMBLE, HEX);
	Serial.print(" 0x"); Serial.print(PN532_STARTCODE2, HEX);
	Serial.print(" 0x"); Serial.print(cmdlen, HEX);
	Serial.print(" 0x"); Serial.print(cmdlen_1, HEX);
	Serial.print(" 0x"); Serial.print(PN532_HOSTTOPN532, HEX);
	#endif

	for( uint8_t i=0 ; i<cmdlen-1 ; i++)
	{
		spiwrite(cmd[i]);
		checksum += cmd[i];
		#ifdef PN532DEBUG
			Serial.print(" 0x"); Serial.print(cmd[i], HEX);
		#endif
	}
	uint8_t checksum_1=~checksum;
	spiwrite(checksum_1);
	spiwrite(PN532_POSTAMBLE);
	digitalWrite(_ss, HIGH);

	#ifdef PN532DEBUG
	Serial.print(" 0x"); Serial.print(checksum_1, HEX);
	Serial.print(" 0x"); Serial.print(PN532_POSTAMBLE, HEX);
	Serial.println();
	#endif
}
/************** low level SPI */


/**
 *
 */
void PN532::spiwrite(uint8_t c)
{
	int8_t i;
	digitalWrite(_clk, HIGH);

	for( i=0 ; i<8 ; i++ )
	{
		digitalWrite(_clk, LOW);

		if( c & _BV(i) )
			digitalWrite(_mosi, HIGH);
		else
			digitalWrite(_mosi, LOW);

		digitalWrite(_clk, HIGH);
	}
}


/**
 *
 */
uint8_t PN532::spiread(void)
{
	int8_t i, x;
	x = 0;
	digitalWrite(_clk, HIGH);

	for (i=0; i<8; i++)
	{
		if( digitalRead(_miso) )
			x |= _BV(i);

		digitalWrite(_clk, LOW);
		digitalWrite(_clk, HIGH);
	}
	return x;
}