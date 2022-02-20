import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'

export async function login(req: Request, res: Response): Promise<void> {
  

  res.status(200).json({message: "hola"})
}