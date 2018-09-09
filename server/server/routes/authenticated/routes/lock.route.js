
import express from 'express'
import validate from 'express-validation'
import expressJwt from 'express-jwt'
import paramValidation from '../../../../config/param-validation'
import Controller from '../../../controllers/authenticated/lock.controller'
import config from '../../../../config/config'

const router = express.Router() // eslint-disable-line new-cap

function authCheck () {
  return expressJwt({ secret: config.jwtSecret })
}

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/')
  .get(authCheck(), Controller.getList)
  .post(authCheck(), Controller.create)

router.route('/:id')
  .get(authCheck(), Controller.get)
  .post(authCheck(), Controller.update)
  .delete(authCheck(), Controller.remove)

export default router
