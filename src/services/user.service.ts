//import { Prisma } from '@prisma/client'
import sgMail from '@sendgrid/mail'
import { UnprocessableEntity /*, NotFound */ } from 'http-errors'
import { hashSync } from 'bcryptjs'
//import { plainToClass } from 'class-transformer'
//import { sign, verify } from 'jsonwebtoken'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
//import { UpdateUserDto } from '../dtos/users/request/update-user.dto'
import { prisma } from '../prisma'
import { TokenDto } from '../dtos/auths/response/token.dto'
//import { PrismaErrorEnum } from '../utils/enums'
//import { UserDto } from '../dtos/users/response/user.dto'
//import { emitter } from '../events'
//import { USER_EMAIL_CONFIRMATION } from '../events/mail.event'
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
      throw new UnprocessableEntity('email already taken')
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

  static async getProfile(id: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id } })
    // eslint-disable-next-line no-console
    console.log(user)

    //return plainToClass(ProfileDto, user)
  }
}
