import express, { NextFunction, Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { plainToClass } from 'class-transformer'
import morgan from 'morgan'
import { HttpErrorDto } from './dtos/http-error.dto'
import { router } from './router'

const app = express()
const PORT = process.env.PORT || 3000
const ENVIROMENT = process.env.NODE_ENV || 'development'

//app.use(passport.initialize())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  if (ENVIROMENT === 'development') {
    // eslint-disable-next-line no-console
    console.error(err.message)
  }

  res.status(err.status ?? 500)
  res.json(plainToClass(HttpErrorDto, err))
}

app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ time: new Date() })
})

app.use('/', router(app))
app.use(errorHandler)

app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port %d, env: %s`, PORT, ENVIROMENT)
})
