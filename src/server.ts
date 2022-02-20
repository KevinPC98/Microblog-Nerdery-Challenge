import express, { NextFunction, Request, Response } from 'express'
import { router } from './router'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 3000
const ENVIROMENT = process.env.NODE_ENV || 'development'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ time: new Date() })
})

app.use('/', router(app))


app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port %d, env: %s`, PORT, ENVIROMENT)
})
