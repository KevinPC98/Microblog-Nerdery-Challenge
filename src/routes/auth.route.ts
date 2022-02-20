import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { login } from '../controllers/auth.controller'

const router = express.Router()

export function authRoutes(): Router {
  router.route('/login').get(asyncHandler(login))
  
  return router
}
