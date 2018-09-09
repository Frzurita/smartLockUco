import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import httpStatus from 'http-status'
import APIError from '../../helpers/APIError'
import config from '../../../config/config'
import User from '../../models/User.model'

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
async function login (req, res, next) {
  // Ideally you'll fetch this from the db
  const userDB = await User.findByEmail(req.body.email)
  // Idea here was to show how jwt works with simplicity
  if (userDB && bcrypt.compareSync(req.body.password, userDB.password)) {
    const exchanges = userDB.auth ? Object.keys(userDB.auth) : []
    const token = jwt.sign({
      email: userDB.email,
      id: userDB._id,
      role: userDB.role
    }, config.jwtSecret)
    return res.json({
      token,
      exchanges
    })
  }
  res.status(401).json({code: 123, message: 'Bad credentials'})
}

async function check (req, res, next) {
  res.json('/Wsuccess/W')
}

async function extractAuth (req, res, next) {
  const user = await User.get(req.user.id)
  req.auth = user.auth[req.params.exchange]
  if (req.auth) {
    next()
  } else {
    const err = new APIError('Usage Limit exceeded', httpStatus.UNAUTHORIZED, true)
    return next(err)
  }
}

export default { login, extractAuth, check }
