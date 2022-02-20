import express, { Router } from 'express'
import { authRoutes } from './routes/auth.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/auth', authRoutes())
  
  return expressRouter
}