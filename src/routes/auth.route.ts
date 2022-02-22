import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { editProfile, login, logout, signup } from '../controllers/auth.controller'

const router = express.Router()

export function authRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))
  router.route('/logout').post(asyncHandler(logout))
  router.route('/profile').patch(asyncHandler(editProfile))

  return router
}
