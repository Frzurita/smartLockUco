import express from 'express'

import accessRoutes from './routes/access.route'
import areaRoutes from './routes/area.route'
// import authRoutes from './routes/auth.route'
import cardRoutes from './routes/card.route'
import lockRoutes from './routes/lock.route'
import userRoutes from './routes/user.route'

const router = express.Router() // eslint-disable-line new-cap

// mount auth routes at /access
router.use('/access', accessRoutes)

// mount auth routes at /area
router.use('/area', areaRoutes)

// // mount auth routes at /auth
// router.use('/auth', authRoutes)

// mount auth routes at /card
router.use('/card', cardRoutes)

// mount lock routes at /lock
router.use('/lock', lockRoutes)

// mount user routes at /user
router.use('/user', userRoutes)

export default router
