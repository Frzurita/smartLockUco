import express from 'express'
import accesssCtrl from '../../../controllers/public/access.controller'

const router = express.Router() // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/').get(accesssCtrl.checkAccessRequest)

export default router
