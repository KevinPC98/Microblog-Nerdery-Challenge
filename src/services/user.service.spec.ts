import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { UnprocessableEntity, NotFound } from 'http-errors'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { LoginDto } from '../dtos/auths/request/login.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { ProfileDto } from '../dtos/users/request/profile.dto'
import { UsersService } from './user.service'

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

describe('update user', () => {
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
    const data = plainToClass(ProfileDto, objuser)
    const result = await UsersService.update(getUser!.id, data)

    expect(result).toHaveProperty([
      'name',
      'userName',
      'email',
      'isEmailPublic',
      'isNamePublic',
      'createdAt',
      'updatedAt',
    ])
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
