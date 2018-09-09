import express from 'express'
import validate from 'express-validation'
import expressJwt from 'express-jwt'
import paramValidation from '../../../../config/param-validation'
import config from '../../../../config/config'

const router = express.Router() // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/access').get(function (req, res) {
  res.json('/Wsuccess/W')
})

export default router
