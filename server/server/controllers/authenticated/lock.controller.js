import mongoose from 'mongoose'
import config from '../../../config/config'
import APIError from '../../services/APIError'
import Lock from '../../models/Lock.model'

async function getList (req, res, next) {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  if (limit > config.MAX_PAGINATION_LIMIT) {
    const error = new APIError('FORBIDEN', 'MAX_PAGINATION_REACHED')
    res.status(error.status).json(error.response)
    return
  }

  if ((!page && page !== 0) || !limit) {
    const error = new APIError('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }

  const list = await Lock.find().skip(limit * page).limit(limit)

  if (list) res.json(list)
}

async function get (req, res, next) {
  let id = req.params.id
  const item = await Lock.findOne({ _id: id }, { __v: 0 }).populate('areaId', '-__v')
  if (!item) {
    const error = new APIError('BAD_REQUEST', 'Area does not exist')
    res.status(error.status).json(error.response)
  }
  res.json(item)
}

async function create (req, res, next) {
  const name = req.body.name
  const capacity = req.body.capacity
  const available = req.body.available
  const areaId = req.body.areaId

  if (!name || !areaId) {
    const error = new Error('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }

  const item = new Lock()
  item.name = name
  item.areaId = areaId
  if (capacity) item.capacity = capacity
  if (available) item.available = available
  let response = await item.save()
  res.json(response)
}

async function update (req, res, next) {
  const id = req.params.id
  const name = req.body.name
  const areaId = req.body.areaId
  const available = req.body.available
  const capacity = req.body.capacity

  if (!name && !areaId && !available && !capacity) {
    const error = new Error('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }

  let setter = {}

  if (name) setter.name = name
  if (areaId) setter.areaId = areaId
  if (available !== undefined) setter.available = available
  if (capacity !== undefined) setter.capacity = capacity

  try {
    const response = await Lock.update({ _id: id }, {$set: setter})
    res.json(response)
  } catch (_error) {
    const error = new APIError('BAD_REQUEST', 'Area id doesn\'t exist')
    res.status(error.status).json(error.response)
  }
}

async function remove (req, res, next) {
  let id = req.params.id
  const response = await Lock.remove({ _id: id })
  res.json(response)
}

export default { get, getList, create, update, remove }
