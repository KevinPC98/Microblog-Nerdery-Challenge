import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import passport from 'passport'
import {
  editProfile,
  login,
  logout,
  signup,
  getProfile,
  confirmAccount,
} from '../controllers/auth.controller'

const router = express.Router()

export function authRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))
  router.route('/logout').post(asyncHandler(logout))
  router
    .route('/profile')
    .patch(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(editProfile),
    )
    .get(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(getProfile),
    )

  router.route('/profile').get(asyncHandler(getProfile))
  router.route('/confirmAccount').post(asyncHandler(confirmAccount))

  return router
}
