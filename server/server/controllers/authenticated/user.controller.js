import bcrypt from 'bcryptjs'
import APIError from '../../services/APIError'
import User from '../../models/User.model'
import config from '../../../config/config'

/**
 * Load user and append to req.
 */
function load (req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user // eslint-disable-line no-param-reassign
      return next()
    })
    .catch(e => next(e))
}

/**
 * Get user
 * @returns {User}
 */
async function get (req, res, next) {
  let id = req.params.id
  const item = await User.findOne({ _id: id }, { __v: 0, password: 0 })
  if (!item) {
    const error = new APIError('BAD_REQUEST', 'User does not exist')
    res.status(error.status).json(error.response)
  }
  res.json(item)
}

/**
 * Get account
 * @returns {AccountInfo}
 */
async function getAccount (req, res) {
  try {
    const userDB = await User.findByEmail(req.user.email)
    const auth = userDB.auth || []
    let user = {
      email: userDB.email,
      exchanges: Object.keys(auth).map(exchange => ({
        apikey: userDB.auth[exchange].apikey,
        exchange: exchange
      }))
    }
    res.json(user)
  } catch (err) {
    res.status(401).json({ code: 123, message: 'No such user exist' })
  }
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @returns {User}
 */
function create (req, res, next) {
  const salt = bcrypt.genSaltSync(process.env.BCRYP)
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt)
  })

  user.save()
    .then(savedUser => res.json(savedUser))
    .catch(e => res.status(400).json({code: 400, message: 'User already exists'}))
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @returns {User}
 */
async function update (req, res, next) {
  const id = req.params.id
  let user = await User.findOne({ _id: id })
  user = Object.assign(user, req.body)
  user.save()

  res.json(user)
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @returns {User}
 */
async function removeExchange (req, res, next) {
  let user = await User.get(req.user.id)
  if (req.body.exchange && typeof user.auth === 'object') {
    delete user.auth[req.body.exchange]
  }
  user.markModified('auth')
  user.save()
    .then(savedUser => res.json({message: 'Exchange deleted successfuly'}))
    .catch(e => next(e))
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
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

  const list = await User.find({}, { password: 0, __v: 0 }).skip(limit * page).limit(limit)

  if (list) res.json(list)
}

async function link (req, res, next) {
  const email = req.user.email
  const user = await User.findByEmail(email)
  user.link({exchange: req.params.exchange, authParams: req.body.auth, type: req.body.type})
  user.save()
}

/**
 * Delete user.
 * @returns {User}
 */
function remove (req, res, next) {
  const id = req.params.id
  User.remove({_id: id})
    .then(response => res.json(response))
    .catch(e => next(e))
}

export default { getList, load, get, create, update, remove, link, getAccount, removeExchange }
