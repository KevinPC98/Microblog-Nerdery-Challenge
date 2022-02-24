import express, { Router } from 'express'
import { authRoutes } from './routes/auth.route'
import { postRoutes } from './routes/post.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/auth', authRoutes())
  app.use('/post', postRoutes())

  return expressRouter
}
