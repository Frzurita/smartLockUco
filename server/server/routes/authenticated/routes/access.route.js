import express from 'express'
import validate from 'express-validation'
import expressJwt from 'express-jwt'
import paramValidation from '../../../../config/param-validation'
import accessCtrl from '../../../controllers/authenticated/access.controller'
import config from '../../../../config/config'

const router = express.Router() // eslint-disable-line new-cap

function authCheck () {
  return expressJwt({ secret: config.jwtSecret })
}

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/')
  .get(authCheck(), accessCtrl.getList)
  .post(authCheck(), accessCtrl.create)

router.route('/:id')
  .get(authCheck(), accessCtrl.get)
  .post(authCheck(), accessCtrl.update)
  .delete(authCheck(), accessCtrl.remove)

export default router
