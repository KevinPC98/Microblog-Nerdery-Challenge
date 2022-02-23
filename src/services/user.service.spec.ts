//import { User } from '@prisma/client'
//import faker from 'faker'
//import jwt from 'jsonwebtoken'
import 'jest-extended/all'
import { plainToClass } from 'class-transformer'
import { UnprocessableEntity /* , NotFound */ } from 'http-errors'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
//import { clearDatabase, prisma } from '../prisma'
//import { UserFactory } from '../utils/factories/user.factory'
//import { UpdateUserDto } from '../dtos/users/request/update-user.dto'
//import { emitter } from '../events'
import { UsersService } from './user.service'
import { AuthService } from './auth.service'

describe('create', () => {
  it('should throw an error if the user already exists', async () => {
    const expected = new UnprocessableEntity('email already taken')
    const value = plainToClass(CreateUserDto, {
      name: 'name',
      userName: 'userName',
      email: 'user@ravn.com',
      password: 'nerdery2022',
      passwordConfirmation: 'nerdery2022',
    })
    const result = UsersService.create(value)

    await expect(result).rejects.toThrowError(expected)
  })

  it('should create a new user and return a Token', async () => {
    const spyCreateToken = jest.spyOn(AuthService, 'createToken')
    const spyGenerateAccessToken = jest.spyOn(
      AuthService,
      'generateAccessToken',
    )
    const value = plainToClass(CreateUserDto, {
      name: 'name',
      userName: 'userName',
      email: 'user@ravn.com',
      password: 'nerdery2022',
      passwordConfirmation: 'nerdery2022',
    })
    const result = await UsersService.create(value)

    expect(spyCreateToken).toHaveBeenCalledOnce()
    expect(spyGenerateAccessToken).toHaveBeenCalledOnce()
    expect(result).toHaveProperty('accessToken', expect.any(String))
    expect(result).toHaveProperty('exp', expect.any(Number))
  })
})
