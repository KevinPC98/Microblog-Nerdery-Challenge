import { plainToClass } from 'class-transformer'
import faker from 'faker'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { Unauthorized, NotFound } from 'http-errors'
import { LoginDto } from '../dtos/auths/request/login.dto'
//import { clearDatabase, prisma } from '../prisma'
//import { UserFactory } from '../utils/factories/user.factory'
//import { TokenFactory } from '../utils/factories/token.factory'
import { AuthService } from './auth.service'

describe('login', () => {
  it('should has a sucessful session and return token', async () => {
    const data = plainToClass(LoginDto, {
      email: 'corenancco@ravn.co',
      password: 'nerdery2022',
    })
    const result = await AuthService.login(data)

    expect(result).toHaveProperty(['accessToken', 'exp'])
  })
  it('should has a failed session and return error', async () => {
    const data = plainToClass(LoginDto, {
      email: 'corenancco@ravn.co',
      password: 'nerdery0000',
    })
    await expect(AuthService.login(data)).toThrowError()
  })
  it('should return a error if user doesnt exist', async () => {
    const data = plainToClass(LoginDto, {
      email: faker.internet.email,
      password: faker.internet.password(8),
    })
    await expect(AuthService.login(data)).toThrowError(
      new Error('User doesnt exist'),
    )
  })
})
