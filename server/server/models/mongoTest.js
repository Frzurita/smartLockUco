const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

mongoose.connect(
  'mongodb://localhost/smartlockuco',
  { server: { socketOptions: { keepAlive: 1 } } }
)

let Schema = mongoose.Schema

const AccessSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const RoomSchema = new Schema({
  code: {
    type: Number,
    required: true
  }
})

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)
const Access = mongoose.model('Access', AccessSchema)
const Room = mongoose.model('Room', RoomSchema)

let room = createRoom()

let user = createUser(room)

createAccess(user)

async function showListOf(model) {
  let list = await model.find()
  console.log('List of: /////////////////////')
  console.log(list)
}

async function showPopulateListOf(model) {
  let list = await model.find().populate({
    path: 'userId',
    populate: {
      path: 'roomId',
      model: 'Room'
    }
  })
  console.log('List of: /////////////////////')
  console.log(list[0].userId.roomId)
  console.log(list)
}

function createRoom() {
  let room = new Room()

  room.code = 1234

  room.save()
  return room
}

function createUser(room) {
  let user = new User()

  user.name = 'Francisco'

  user.roomId = new mongoose.Types.ObjectId(room._id)

  user.save()
  return user
}

function createAccess(user) {
  let access = new Access()

  access.userId = new mongoose.Types.ObjectId(user._id)

  access.save()

  showPopulateListOf(Access)
}
