import { User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { UsersService } from '../services/user.service'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { AuthService } from '../services/auth.service'
import { LoginDto } from '../dtos/auths/request/login.dto'
import { ProfileDto } from '../dtos/users/request/profile.dto'

export async function login(req: Request, res: Response): Promise<void> {
  const data = plainToClass(LoginDto, req.body)
  const isValid = await data.isValid()

  if (isValid) {
    const token = await AuthService.login(data)

    res.status(201)
    res.json(token)
  }
}
export async function editProfile(req: Request, res: Response): Promise<void> {
  const data = plainToClass(ProfileDto, req.body)
  const isValid = await data.isValid()
  if (isValid) {
    const user = req.user as User
    const updatedUser = await UsersService.update(user.id, data)

    res.status(201)
    res.json(updatedUser)
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  await AuthService.logout(token as string)
  res.status(204).json({})
}

export async function signup(req: Request, res: Response): Promise<void> {
  if (req.body.password != req.body.passwordConfirmation) {
    res.status(400).send({ message: 'Passwords must be the same' })
  }

  const dto = plainToClass(CreateUserDto, req.body)
  await dto.isValid()
  const token = await UsersService.create(dto)
  res.status(201).json(token)
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = req.user as User
  //console.log('USERCONTROLLER: ' + user)
  const profileUser = await UsersService.getProfile(user.id)
  res.status(201).json(profileUser)
}
