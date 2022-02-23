import { plainToClass } from 'class-transformer'
import faker from 'faker'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { Unauthorized, NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
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
})
