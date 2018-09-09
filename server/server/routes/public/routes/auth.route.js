import express from 'express'
import validate from 'express-validation'
import expressJwt from 'express-jwt'
import paramValidation from '../../../../config/param-validation'
import authCtrl from '../../../controllers/public/auth.controller'
import config from '../../../../config/config'

const router = express.Router() // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login)

router.route('/check')
  .get(authCtrl.check)

export default router
