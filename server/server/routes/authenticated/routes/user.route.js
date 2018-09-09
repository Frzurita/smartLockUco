import express from 'express'
import expressJwt from 'express-jwt'
import config from '../../../../config/config'
import validate from 'express-validation'
import paramValidation from '../../../../config/param-validation'
import userCtrl from '../../../controllers/authenticated/user.controller'

const router = express.Router() // eslint-disable-line new-cap

router.route('/')
  .get(expressJwt({ secret: config.jwtSecret }), userCtrl.getList)
  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create)

router.route('/:id')
  /** PUT /api/users/:userId - Update user */
  .get(expressJwt({ secret: config.jwtSecret }), userCtrl.get)
  .put(validate(paramValidation.updateUser), expressJwt({ secret: config.jwtSecret }), userCtrl.update)
  .delete(expressJwt({ secret: config.jwtSecret }), userCtrl.remove)

router.route('/:exchange/link')
  .post(expressJwt({ secret: config.jwtSecret }), userCtrl.link)

router.route('/account')
  /** GET /api/users/account - Get information for user account */
  .get(expressJwt({ secret: config.jwtSecret }), userCtrl.getAccount)

router.route('/exchanges')
  .delete(expressJwt({ secret: config.jwtSecret }), userCtrl.removeExchange)

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load)

export default router
