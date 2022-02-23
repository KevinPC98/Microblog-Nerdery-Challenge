import { plainToClass } from 'class-transformer'
import faker from 'faker'
//import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { /* Unauthorized, */ NotFound } from 'http-errors'
import { User } from '@prisma/client'
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

describe('createToken', () => {
  it('should throw an error if the user does not exist', async () => {
    const expected = new NotFound('User not found')
    const result = AuthService.createToken(expect.any(String))

    await expect(result).rejects.toThrowError(expected)
  })

  it('should create the token', async () => {
    const user: User = {
      id: '6b3a5089-5a83-4a59-9a18-5247ddfa5201',
      name: 'name',
      userName: 'userName',
      email: 'user@ravn.com',
      password: 'nerdery2022',
      isActive: false,
      isEmailPublic: false,
      isNamePublic: false,
      createdAt: expect.any(Date),
      verifiedAt: expect.any(Date),
      updatedAt: expect.any(Date),
      role: 'U',
    }
    const result = await AuthService.createToken(user.id)

    expect(result).toHaveProperty('userId', user.id)
  })
})

describe('generateAccessToken', () => {
  it('should generate a token', async () => {
    const result = AuthService.generateAccessToken(expect.any(String))

    expect(result).toHaveProperty('accessToken', '123.123.123')
  })
})
