import { plainToClass } from 'class-transformer'
import { Unauthorized, NotFound } from 'http-errors'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { GetPostDto } from '../dtos/post/response/getPost.dto'
import { ResponsePostDto } from '../dtos/post/response/responsepost.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'

export class PostService {
  static async create(
    userId: string,
    data: RequestPostDto,
  ): Promise<ResponsePostDto> {
    try {
      const post = await prisma.post.create({
        data: {
          ...data,
          userId,
        },
      })

      return plainToClass(ResponsePostDto, post)
    } catch (error) {
      throw new NotFound("user doesn't exist")
    }
  }

  static async get(postId: string): Promise<GetPostDto> {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: true,
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: true,
        },
      })
      const countDislike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: true,
        },
      })
      return plainToClass(GetPostDto, {
        ...post,
        countLike,
        countDislike,
      })
    } catch (error) {
      throw new NotFound("Post doesn't exist")
    }
  }
}
