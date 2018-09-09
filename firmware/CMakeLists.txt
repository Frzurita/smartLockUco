cmake_minimum_required(VERSION 2.8.4)
set(CMAKE_TOOLCHAIN_FILE ${CMAKE_SOURCE_DIR}/cmake/ArduinoToolchain.cmake)
set(PROJECT_NAME smartlockuco)
project(${PROJECT_NAME})

#set(${CMAKE_PROJECT_NAME}_SKETCH smartlockuco.ino)
#set(${CMAKE_PROJECT_NAME}_BOARD uno)
#set(${CMAKE_PROJECT_NAME}_PORT /dev/cu.usbmodem1411)
#
#generate_arduino_firmware(${CMAKE_PROJECT_NAME} SRCS smartlockuco.ino EventManager/EventManager.cpp)


include_directories("EventManager/")
include_directories("PN532/")
set(${CMAKE_PROJECT_NAME}_SKETCH smartlockuco.ino)
set(${CMAKE_PROJECT_NAME}_BOARD uno)
set(${CMAKE_PROJECT_NAME}_PORT /dev/cu.usbmodem1411)

generate_arduino_firmware(${CMAKE_PROJECT_NAME} SRCS smartlockuco.ino PN532/PN532.cpp EventManager/EventManager.cpp)