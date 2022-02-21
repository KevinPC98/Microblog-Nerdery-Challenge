import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { CreateUserDto } from '../dtos/auths/request/signup.dto'
import { UsersService } from '../services/user.service'


export async function login(req: Request, res: Response): Promise<void> {
  

  res.status(200).json({message: "hola"})
}

export async function signup(req: Request, res: Response): Promise<void> {

}
