import { plainToClass } from 'class-transformer'
import faker from 'faker'
import jwt from 'jsonwebtoken'
import { UnprocessableEntity, NotFound, Conflict } from 'http-errors'
import { User } from '@prisma/client'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { ProfileDto } from '../dtos/users/request/profile.dto'
import { UsersService } from './user.service'

describe('UserService', () => {
  const objuser = plainToClass(CreateUserDto, {
    name: faker.name.firstName(),
    userName: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'U',
  })

  const objuserTwo = plainToClass(CreateUserDto, {
    name: faker.name.firstName(),
    userName: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'U',
  })

  describe('Update', () => {
    let createdUser: User

    beforeEach(async () => {
      createdUser = await prisma.user.create({
        data: {
          ...objuser,
        },
      })
      await prisma.user.create({
        data: {
          ...objuserTwo,
        },
      })
    })

    afterEach(async () => {
      await prisma.user.delete({
        where: {
          email: objuser.email,
        },
      })
      await prisma.user.delete({
        where: {
          email: objuserTwo.email,
        },
      })
    })

    it('should update a user successfully', async () => {
      const data = plainToClass(ProfileDto, {
        name: faker.name.firstName(),
        userName: faker.internet.userName(),
      })

      const result = await UsersService.update(createdUser.id, data)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('userName')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('isEmailPublic')
      expect(result).toHaveProperty('isNamePublic')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })

    it("shouldn't update if sent email is equal to other user's email", async () => {
      const data = plainToClass(ProfileDto, { email: objuserTwo.email })

      await expect(UsersService.update(createdUser.id, data)).rejects.toThrow(
        new UnprocessableEntity('email already exist'),
      )
    })

    it('should return a error if user id doesnt exist', async () => {
      const userId = 'uuid'
      const data = plainToClass(ProfileDto, objuser)

      await expect(UsersService.update(userId, data)).rejects.toThrow(
        new NotFound('User not found'),
      )
    })
  })

  describe('create', () => {
    afterEach(async () => {
      await prisma.user.delete({
        where: {
          email: objuser.email,
        },
      })
    })
    it('should return an error if the email has already been used', async () => {
      await prisma.user.create({
        data: {
          ...objuser,
        },
      })

      const expected = new Conflict('Email belong other user')
      const result = UsersService.create(objuser)

      await expect(result).rejects.toThrowError(expected)
    })

    it('should return a token and create a new user', async () => {
      const result = await UsersService.create(objuser)

      expect(result).toHaveProperty('accessToken', expect.any(String))
      expect(result).toHaveProperty('exp', expect.any(Number))
    })
  })

  describe('generateEmailConfirmationToken', () => {
    it('should return the confirmation token', () => {
      const data = faker.datatype.uuid()
      const result = UsersService.generateEmailConfirmationToken(data)

      expect(typeof result).toBe('string')
    })
  })

  describe('confirmAccount', () => {
    const token = faker.random.word()
    let createdUser: User
    beforeEach(async () => {
      createdUser = await prisma.user.create({
        data: {
          ...objuser,
        },
      })
    })
    afterEach(async () => {
      await prisma.user.delete({
        where: {
          email: objuser.email,
        },
      })
    })

    it('should throw an error if the token is not valid', async () => {
      const expected = new UnprocessableEntity('Invalid Token')
      const result = UsersService.confirmAccount(token)
      await expect(result).rejects.toThrowError(expected)
    })

    it('should throw an error if the user does not exists', async () => {
      const expected = new NotFound('User not found')
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: faker.datatype.uuid() })))
      const result = UsersService.confirmAccount(token)

      await expect(result).rejects.toThrowError(expected)
    })

    it('should throw an error if the account of user already was confirmed', async () => {
      const expected = new UnprocessableEntity('Account already confirmed')

      const userConfirmed = await prisma.user.update({
        where: {
          email: createdUser.email,
        },
        data: {
          isActive: true,
          verifiedAt: faker.datatype.datetime(),
        },
      })

      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: userConfirmed.id })))

      await expect(UsersService.confirmAccount(token)).rejects.toThrowError(
        expected,
      )
    })

    it('should confirm account of user', async () => {
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: createdUser.id })))

      const result = await UsersService.confirmAccount(token)

      expect(result).toBeUndefined()
    })
  })

  describe('getProfile', () => {
    const objuser = plainToClass(CreateUserDto, {
      name: faker.name.firstName(),
      userName: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'U',
    })

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          ...objuser,
        },
      })
    })
    afterEach(async () => {
      await prisma.user.delete({
        where: {
          email: objuser.email,
        },
      })
    })
    it('should return a profile of user', async () => {
      const getUser = await prisma.user.findUnique({
        where: {
          email: objuser.email,
        },
        select: {
          id: true,
        },
        rejectOnNotFound: false,
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await UsersService.getProfile(getUser!.id)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('userName')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('isEmailPublic')
      expect(result).toHaveProperty('isNamePublic')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })

    it('should throw an error if user does not exist', async () => {
      const userId = 'uuid'
      await expect(UsersService.getProfile(userId)).rejects.toThrow(
        new NotFound('User not found'),
      )
    })
  })
})
