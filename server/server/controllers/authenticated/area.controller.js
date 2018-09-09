import mongoose from 'mongoose'
import config from '../../../config/config'
import APIError from '../../services/APIError'
import Area from '../../models/Area.model'

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

  const list = await Area.find().skip(limit * page).limit(limit)

  if (list) res.json(list)
}

async function get (req, res, next) {
  let id = req.params.id
  const item = await Area.findOne({ _id: id }, { __v: 0 })
  if (!item) {
    const error = new APIError('BAD_REQUEST', 'Area does not exist')
    res.status(error.status).json(error.response)
  }
  res.json(item)
}

async function create (req, res, next) {
  const name = req.body.name

  if (!name) {
    const error = new Error('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }

  const item = new Area()
  item.name = name
  let response = await item.save()
  res.json(response)
}

async function update (req, res, next) {
  let id = req.params.id
  let name = req.body.name

  if (!name) {
    const error = new Error('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }
  try {
    const response = await Area.update({ _id: id }, {$set: {name: name}})
    res.json(response)
  } catch (_error) {
    const error = new APIError('BAD_REQUEST', 'Area id doesn\'t exist')
    res.status(error.status).json(error.response)
  }
}

async function remove (req, res, next) {
  let id = req.params.id
  const response = await Area.remove({ _id: id })
  res.json(response)
}

export default { get, getList, create, update, remove }
