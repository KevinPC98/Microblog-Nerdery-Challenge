import { Prisma } from '@prisma/client'
import { UnprocessableEntity, NotFound } from 'http-errors'
import sgMail from '@sendgrid/mail'
import { hashSync } from 'bcryptjs'
import { plainToClass } from 'class-transformer'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { TokenDto } from '../dtos/auths/response/token.dto'
//import { UserDto } from '../dtos/users/response/user.dto'
//import { emitter } from '../events'
//import { USER_EMAIL_CONFIRMATION } from '../events/mail.event'
import { ProfileDto } from '../dtos/users/request/profile.dto'
import { UserDto } from '../dtos/users/response/user.dto'
import { PrismaErrorEnum } from '../utils/enums'
import { AuthService } from './auth.service'

export class UsersService {
  static async create({
    password,
    ...input
  }: CreateUserDto): Promise<TokenDto> {
    const userFound = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
      rejectOnNotFound: false,
    })

    if (userFound) {
      throw new UnprocessableEntity('email belong other user')
    }

    const user = await prisma.user.create({
      data: {
        ...input,
        password: hashSync(password, 10),
        role: 'U',
      },
    })
    const token = await AuthService.createToken(user.id)

    const sendEmail = async () => {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
      const msg = {
        to: user.email as string,
        from: process.env.SENDGRID_SENDER_EMAIL as string,
        subject: 'Confirm Account',
        text: 'please confirm your email',
        html: `<strong>Token: ${token}</strong>`,
      }
      //ES6
      try {
        await sgMail.send(msg)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
    sendEmail()
    return AuthService.generateAccessToken(token.jti)
  }

  static async update(userId: string, user: ProfileDto): Promise<UserDto> {
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...user,
        },
      })
      return plainToClass(UserDto, updatedUser)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('User not found')
          case PrismaErrorEnum.DUPLICATED:
            throw new UnprocessableEntity('email already exist')
          default:
            throw error
        }
      }

      throw error
    }
  }
  static async getProfile(id: string): Promise<UserDto> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        rejectOnNotFound: true,
      })

      return plainToClass(UserDto, user)
    } catch (error) {
      throw new NotFound('User not found')
    }
  }
}
