import express from 'express'

import authRoutes from './authenticated/index.route'
import publicRoutes from './public/index.route'

const router = express.Router() // eslint-disable-line new-cap

// mount authenticated routes at /auth
router.use('/auth', authRoutes)

router.use('/public', publicRoutes)

export default router
