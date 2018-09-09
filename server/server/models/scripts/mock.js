require('babel-register')({ presets: ['env'] })
const Area = require('../Area.model').default
const Access = require('../Access.model').default
const Permission = require('../Permission.model').default
const Place = require('../Place.model').default
const User = require('../User.model').default

const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

mongoose.connect(
  'mongodb://localhost/smartlockuco',
  { server: { socketOptions: { keepAlive: 1 } } }
)

let area = new Area({
  name: 'Escuela Politécnica',
  code: 'EPS'
})

let place = new Place({
  name: 'Laboratorio 2',
  area: area._id,
  code: 'ABCD'
})

let user = new User({
  email: 'pepe@elchocolatero.com',
  password: 'eeeee'
})

let access = new Access({
  user: user._id,
  place: place._id
})

area.save()
place.save()
user.save()
access.save()
