import { Prisma, Token } from '@prisma/client'
import { compareSync } from 'bcryptjs'
import { Unauthorized, NotFound } from 'http-errors'
import { sign } from 'jsonwebtoken'
import { LoginDto } from '../dtos/auths/request/login.dto'
import { TokenDto } from '../dtos/auths/response/token.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'

export class AuthService {
  static async login(data: LoginDto): Promise<TokenDto> {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) throw new Unauthorized('User doesnt exist')

    const validPassword = compareSync(data.password, user.password)

    if (!validPassword) throw new Unauthorized('Password incorrect')

    const recordToken = await this.createToken(user.id)

    return this.generateAccessToken(recordToken.jti)
  }
  static async logout(token: TokenDto): Promise<void> {}
  static async createToken(userId: string): Promise<Token> {
    try {
      const token = await prisma.token.create({
        data: {
          userId,
        },
      })
      return token
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT:
            throw new NotFound('User not found')
          default:
            throw error
        }
      }

      throw error
    }
  }

  static generateAccessToken(sub: string): TokenDto {
    const now = new Date().getTime()
    const exp = Math.floor(
      new Date(now).setSeconds(
        parseInt(process.env.JWT_EXPIRATION_TIME as string, 10),
      ) / 1000,
    )

    const iat = Math.floor(now / 1000)

    const accessToken = sign(
      {
        sub,
        iat,
        exp,
      },
      process.env.JWT_SECRET_KEY as string,
    )

    return {
      accessToken,
      exp,
    }
  }
}
