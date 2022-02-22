import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { CreateUserDto } from '../dtos/auths/request/signup.dto'
import { UsersService } from '../services/user.service'
import { AuthService } from '../services/auth.service'
import { LoginDto } from '../dtos/auths/request/login.dto'

export async function login(req: Request, res: Response): Promise<void> {
  const data = plainToClass(LoginDto, req.body)
  const isValid = await data.isValid()

  if (isValid) {
    const token = await AuthService.login(data)
    console.log(token)
    res.status(201)
    res.json(token)
  }
  // const token = await AuthService.login(data)
}
export async function editProfile(req: Request, res: Response): Promise<void>{
  
}

export async function logout(req:Request, res: Response):Promise<void>{
  const token = req.headers.token

}

export async function signup(req: Request, res: Response): Promise<void> {
  if (req.body.password !== req.body.passwordConfirmation) {
    res.send(400)
  }
}
