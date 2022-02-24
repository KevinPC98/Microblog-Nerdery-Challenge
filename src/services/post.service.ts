import { Prisma } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { NotFound } from 'http-errors'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('Post not found')
          default:
            throw error
        }
      }

      throw error
    }
  }
  static async delete(postId: string): Promise<boolean> {
    try {
      const post = await prisma.post.delete({
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

  static async createUpdateLike(
    userId: string,
    postId: string,
    data: RequestLiketDto,
  ): Promise<void> {
    try {
      const like = await prisma.like.findFirst({
        where: {
          type: 'P',
          likeItemId: postId,
          userId,
        },
        rejectOnNotFound: false,
      })
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: false,
      })

      if (!post) throw new NotFound('Post not found')

      if (!like) {
        await prisma.like.create({
          data: {
            ...data,
            userId: userId,
            type: 'P',
            likeItemId: postId,
          },
        })
      } else {
        await prisma.like.updateMany({
          where: {
            type: 'P',
            likeItemId: postId,
            userId: userId,
          },
          data: {
            ...data,
          },
        })
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('User not found')
          default:
            throw error
        }
      }
      throw error
    }
  }

  static async deleteLike(userId: string, postId: string): Promise<void> {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: false,
      })

      if (!post) throw new NotFound('Post not found')

      await prisma.like.deleteMany({
        where: {
          userId: userId,
          likeItemId: postId,
          type: 'P',
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('User not found')
          default:
            throw error
        }
      }
      throw error
    }
  }
}
