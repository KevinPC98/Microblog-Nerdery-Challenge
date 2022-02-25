import { plainToClass } from 'class-transformer'
import faker from 'faker'
import jwt from 'jsonwebtoken'
import { UnprocessableEntity, NotFound } from 'http-errors'
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
    beforeEach(async () => {
      await prisma.user.create({
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
      const getUser = await prisma.user.findUnique({
        where: {
          email: objuser.email,
        },
        select: {
          id: true,
        },
        rejectOnNotFound: false,
      })
      const data = plainToClass(ProfileDto, {
        name: faker.name.firstName(),
        userName: faker.internet.userName(),
      })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await UsersService.update(getUser!.id, data)

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('userName')
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('isEmailPublic')
      expect(result).toHaveProperty('isNamePublic')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('updatedAt')
    })

    it("shouldn't update if sent email is equal to other user's email", async () => {
      const getUser = await prisma.user.findUnique({
        where: {
          email: objuser.email,
        },
        select: {
          id: true,
        },
        rejectOnNotFound: false,
      })
      const data = plainToClass(ProfileDto, { email: objuserTwo.email })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await expect(UsersService.update(getUser!.id, data)).rejects.toThrow(
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

      const expected = new UnprocessableEntity('email belong other user')
      const result = UsersService.create(objuser)

      await expect(result).rejects.toThrowError(expected)
    })

    it('should return a token a create a new user', async () => {
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGFkZDhlNi0zMTg0LTQ4NzMtYTI4OS01YmFmMTlkOWFhZjIiLCJpYXQiOjE2NDU3MjM4MzksImV4cCI6MTY0NTcyNjgwMH0.X5krO0u2GZ3voEKuhtd9FCic_GVWR5SnL8ivoYtxgOE'
      const confirmationToken = ''
      // const spyCreateToken = jest.spyOn(AuthService, 'createToken')
      // const spyGenerateAccessToken = jest.spyOn(
      //   AuthService,
      //   'generateAccessToken',
      // )

      const result = await UsersService.create(objuser)

      // expect(spyCreateToken).toHaveBeenCalledOnce()
      // expect(spyGenerateAccessToken).toHaveBeenCalledOnce()
      expect(result).toHaveProperty('accessToken', expect.any(String))
      expect(result).toHaveProperty('exp', expect.any(Number))
    })
  })

  describe('generateEmailConfirmationToken', () => {
    afterEach(async () => {
      await prisma.user.delete({
        where: {
          email: objuser.email,
        },
      })
    })
    it('should return the signed token', async () => {
      await prisma.user.create({
        data: {
          ...objuser,
        },
      })
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
      const result = await UsersService.generateEmailConfirmationToken(
        getUser!.id,
      )

      expect(typeof result).toBe('string')
    })
  })

  describe('confirmAccount', () => {
    const token = faker.random.word()
    beforeEach(async () => {
      await prisma.user.create({
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
    it('should throw an error if the token is not valid', async () => {
      const expected = new UnprocessableEntity('Invalid Token')
      const result = UsersService.confirmAccount(token)
      await expect(result).rejects.toThrowError(expected)
    })

    it('should throw an error if the token does not belong to user', async () => {
      const expected = new UnprocessableEntity('Invalid Token')
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: faker.datatype.uuid() })))
      const result = UsersService.confirmAccount(token)

      await expect(result).rejects.toThrowError(expected)
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
