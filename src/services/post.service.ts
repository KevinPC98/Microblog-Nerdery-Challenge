import { plainToClass } from 'class-transformer'
import { NotFound } from 'http-errors'
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

  static async update(
    postId: string,
    data: RequestPostDto,
  ): Promise<ResponsePostDto> {
    try {
      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          ...data,
        },
      })

      return plainToClass(ResponsePostDto, updatedPost)
    } catch (error) {
      throw new NotFound('Post not found')
    }
  }
  static async delete(postId: string): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: {
          id: postId,
        },
      })
      await prisma.like.deleteMany({
        where: {
          likeItemId: postId,
          type: 'P',
        },
      })
      return true
    } catch (error) {
      throw new NotFound('Post not found')
    }
  }
}
