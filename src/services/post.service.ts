import { Prisma } from '@prisma/client'
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
        select: {
          id: true,
          title: true,
          content: true,
          isPublic: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              userName: true,
            },
          },
        },
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: post.id,
          like: true,
        },
      })

      const countDisLike = await prisma.like.count({
        where: {
          likeItemId: post.id,
          like: false,
        },
      })

      return plainToClass(ResponsePostDto, {
        ...post,
        countLike,
        countDisLike,
      })
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
        select: {
          id: true,
          title: true,
          content: true,
          isPublic: true,
          createdAt: true,
          user: {
            select: {
              userName: true,
            },
          },
        },
        rejectOnNotFound: true,
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: true,
        },
      })

      const countDisLike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: false,
        },
      })

      return plainToClass(GetPostDto, {
        ...post,
        countLike,
        countDisLike,
      })
    } catch (error) {
      throw new NotFound("Post doesn't exist")
    }
  }

  static async update(
    userId: string,
    postId: string,
    data: RequestPostDto,
  ): Promise<ResponsePostDto> {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: true,
      })

      if (post?.userId !== userId)
        throw new Unauthorized("User isn't authorized to update this post")

      const updatedPost = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          ...data,
        },
        select: {
          id: true,
          title: true,
          content: true,
          isPublic: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              userName: true,
            },
          },
        },
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: true,
        },
      })
      const countDisLike = await prisma.like.count({
        where: {
          likeItemId: postId,
          like: false,
        },
      })

      return plainToClass(ResponsePostDto, {
        ...updatedPost,
        countLike,
        countDisLike,
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log((error as Error).message)
      throw error
    }
  }

  static async delete(userId: string, postId: string): Promise<boolean> {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: true,
      })

      if (post?.userId !== userId)
        throw new Unauthorized("User isn't authorized to update this post")

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
      // eslint-disable-next-line no-console
      console.log((error as Error).message)
      throw error
    }
  }
}
