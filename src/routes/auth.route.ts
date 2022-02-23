import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { login, signup, getProfile } from '../controllers/auth.controller'

const router = express.Router()

export function authRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))
  router.route('/profile').get(asyncHandler(getProfile))
  return router
}
