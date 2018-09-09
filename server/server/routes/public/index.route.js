import express from 'express'

import authRoutes from './routes/auth.route'
import lockRoutes from './routes/lock.route'
import accessRoutes from './routes/access.route'

const router = express.Router() // eslint-disable-line new-cap

// mount auth routes at /auth
router.use('/auth', authRoutes)

// mount lock routes at /lock
router.use('/lock', lockRoutes)

// mount lock routes at /access
router.use('/access', accessRoutes)

export default router
