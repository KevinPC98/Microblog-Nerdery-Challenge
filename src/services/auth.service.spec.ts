import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { Unauthorized } from 'http-errors'
import { hashSync } from 'bcryptjs'
//import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { /* Unauthorized, */ NotFound } from 'http-errors'
import { User } from '@prisma/client'
import { LoginDto } from '../dtos/auths/request/login.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  const user = plainToClass(CreateUserDto, {
    name: faker.name.firstName(),
    userName: faker.internet.userName(),
    email: faker.internet.email(),
  })

  describe('login', () => {
    afterAll(async () => {
      await prisma.user.delete({
        where: {
          email: user.email,
        },
      })
    })
    it('should has a sucessful session and return token', async () => {
      const pwd = faker.internet.password(8)
      await prisma.user.create({
        data: {
          ...user,
          password: hashSync(pwd, 10),
          role: 'U',
        },
      })
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: pwd,
      })
      const result = await AuthService.login(data)

      expect(result).toHaveProperty('accessToken')
    })

    it('should has a failed session because of password is incorrect and throw error', async () => {
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: faker.internet.password(8),
      })
      await expect(AuthService.login(data)).rejects.toThrow(
        new Unauthorized('Password incorrect'),
      )
    })

    it('should return a error if user doesnt exist', async () => {
      const data = plainToClass(LoginDto, {
        email: faker.internet.email,
        password: faker.internet.password(8),
      })
      await expect(AuthService.login(data)).rejects.toThrow(
        new Unauthorized('User doesnt exist'),
      )
    })
  })

  describe('logout', () => {
    afterAll(async () => {
      await prisma.user.delete({
        where: {
          email: user.email,
        },
      })
    })
    it('should delete token and have a sucessful logout', async () => {
      const pwd = faker.internet.password(8)
      await prisma.user.create({
        data: {
          ...user,
          password: hashSync(pwd, 10),
          role: 'U',
        },
      })
      const data = plainToClass(LoginDto, {
        email: user.email,
        password: pwd,
      })

      const token = await AuthService.login(data)

      expect(await AuthService.logout(token.accessToken)).toBeUndefined()
    })

    it("should throw error if the token isn't validate", async () => {
      const token = faker.name.firstName()
      await expect(AuthService.logout(token)).rejects.toThrow(
        new Unauthorized('invalidate token'),
      )
    })
  })

  describe('createToken', () => {
    it('should throw an error if the user does not exist', async () => {
      const expected = new NotFound('User not found')
      const result = AuthService.createToken(faker.datatype.uuid())

      await expect(result).rejects.toThrowError(expected)
    })

    it('should create the token', async () => {
      const user: User = {
        id: faker.datatype.uuid(),
        name: faker.name.firstName(),
        userName: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        isActive: faker.datatype.boolean(),
        isEmailPublic: faker.datatype.boolean(),
        isNamePublic: faker.datatype.boolean(),
        createdAt: faker.datatype.datetime(),
        verifiedAt: faker.datatype.datetime(),
        updatedAt: faker.datatype.datetime(),
        role: 'U',
      }
      const result = await AuthService.createToken(user.id)

      expect(result).toHaveProperty('userId', user.id)
    })
  })

  describe('generateAccessToken', () => {
    it('should generate a token', async () => {
      const accessToken = faker.lorem.word()
      const result = AuthService.generateAccessToken(accessToken)

      expect(result).toHaveProperty('accessToken', accessToken)
    })
  })
})
