//import { Prisma } from '@prisma/client'
import { UnprocessableEntity, NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
import { plainToClass } from 'class-transformer'
import { sign, verify } from 'jsonwebtoken'
import { CreateUserDto } from '../dtos/auths/request/signup.dto'
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
      },
    })
    const token = await AuthService.createToken(user.id)

/*     emitter.emit(USER_EMAIL_CONFIRMATION, {
      email: user.email,
      userUUID: user.uuid,
    }) */

    return AuthService.generateAccessToken(token.jti)
  }

}
