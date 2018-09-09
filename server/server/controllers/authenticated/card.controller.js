import mongoose from 'mongoose'
import config from '../../../config/config'
import APIError from '../../helpers/APIError'
import Card from '../../models/Card.model'

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

  const list = await Card.find().skip(limit * page).limit(limit).select('-__v')

  if (list) res.json(list)
}

async function get (req, res, next) {
  let id = req.params.id
  const card = await Card.findOne({ _id: id }).populate('userId', '-password -__v')
  if (!card) {
    const error = new APIError('BAD_REQUEST', 'Card does not exist')
    res.status(error.status).json(error.response)
  }
  res.json(card)
}

async function create (req, res, next) {
  let card = await Card.create()
  if (card.nfcCredentials) res.json(card.nfcCredentials)
  else {
    const error = new APIError('BAD_REQUEST', 'No nfc credentials generated')
  }
}

async function update (req, res, next) {
  let id = req.params.id
  let userId = req.body.userId

  if (!userId) {
    const error = new Error('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.status(error.status).json(error.response)
    return
  }
  try {
    const response = await Card.update({ _id: id }, {$set: {userId: userId}})
    res.json(response)
  } catch (_error) {
    const error = new APIError('BAD_REQUEST', 'Card id doesn\'t exist')
    res.status(error.status).json(error.response)
  }
}

async function remove (req, res, next) {
  let id = req.params.id
  const response = await Card.remove({_id: id})
  res.json(response)
}

export default { get, getList, create, update, remove }
