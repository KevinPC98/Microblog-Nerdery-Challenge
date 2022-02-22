import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
//import bcrypt from 'bcryptjs'
//import { SignUpDto } from '../dtos/auths/request/signup.dto'
import { UsersService } from '../services/user.service'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'

export async function login(req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: 'hola' })
}

export async function signup(req: Request, res: Response): Promise<void> {
  if (req.body.password != req.body.passwordConfirmation) {
    res.status(400).send({ message: 'Passwords must be the same' })
  }

  const dto = plainToClass(CreateUserDto, req.body)
  await dto.isValid()
  const token = await UsersService.create(dto)
  res.status(201).send({ user: token })
}
