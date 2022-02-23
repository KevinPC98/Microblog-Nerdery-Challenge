import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { UnprocessableEntity, NotFound } from 'http-errors'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { ProfileDto } from '../dtos/users/request/profile.dto'
import { UsersService } from './user.service'
import { AuthService } from './auth.service'

describe('UserService', () => {
  describe('update user', () => {
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
  })
})
