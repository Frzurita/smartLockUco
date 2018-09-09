import APIError from '../../helpers/APIError'
import config from '../../../config/config'
import Card from '../../models/Card.model'
import Lock from '../../models/Lock.model'
import Access from '../../models/Access.model'

async function checkAccessRequest (req, res, next) {
  const lockId = req.headers.lockid
  const areaId = req.headers.areaid
  let nfcCredentials = parseInt(req.headers.nfccredentials)
  let card, lock
  
  try {
    card = await Card.findOne({ nfcCredentials }).populate('userId')
  } catch (err) {
    const error = new APIError('NOT_FOUND', 'User nor found')
    res.status(error.status).json(error.response)
  }

  try {
    lock = await Lock.findOne({
      _id: lockId
    }).populate('area')
  } catch (err) {
    res.status(404).json({ status: 404, error: 'Place not found' })
    return
  }

  try {
    const access = await Access.findOne({
      $or: [
        {
          'start': { '$lt': new Date() },
          'end': { '$exists': false },
          'cardId': card._id,
          'lockId': lock._id
        },
        {
          'start': { '$lt': new Date() },
          'end': { '$gte': new Date() },
          'cardId': card._id,
          'lockId': lock._id
        },
        {
          'start': { '$lt': new Date() },
          'end': { '$gte': new Date() },
          'cardId': card._id,
          'areaId': lock.areaId
        },
        {
          'start': { '$lt': new Date() },
          'end': { '$exists': false },
          'cardId': card._id,
          'areaId': lock.areaId
        }
      ]
    })
    if (access) res.json('/Wsuccess/W')
    else {
      const error = new APIError('FORBIDEN', 'No access found')
      res.status(error.status).json(error.response)
    }
  } catch (err) {
    console.log(err)
    const error = new APIError('BAD_REQUEST', 'INCORRECT_PARAMS')
    res.json(error.status).json(error.response)
  }
}

export default { checkAccessRequest }
