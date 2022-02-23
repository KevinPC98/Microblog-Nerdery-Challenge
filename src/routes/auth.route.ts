import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import passport from 'passport'
import {
  editProfile,
  login,
  logout,
  signup,
  getProfile,
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

  router.route('/profile').get(asyncHandler(getProfile))
  return router
}
