import { NotFound } from 'http-errors'
import { Comment, Post } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
import { PrismaErrorEnum } from '../utils/enums'
export class LikeService {
  static async createUpdateLike(
    type: string,
    userId: string,
    likeItemId: string,
    data: RequestLiketDto,
  ): Promise<void> {
    try {
      const like = await prisma.like.findFirst({
        where: {
          type: type,
          likeItemId: likeItemId,
          userId,
        },
        rejectOnNotFound: false,
      })

      let item: Post | Comment | null

      if (type === 'P') {
        item = await prisma.post.findUnique({
          where: {
            id: likeItemId,
          },
          rejectOnNotFound: false,
        })

        if (!item) throw new NotFound('Post not found')
      } else {
        item = await prisma.comment.findUnique({
          where: {
            id: likeItemId,
          },
          rejectOnNotFound: false,
        })

        if (!item) throw new NotFound('Comment not found')
      }

      if (!like) {
        await prisma.like.create({
          data: {
            ...data,
            userId: userId,
            type: type,
            likeItemId: likeItemId,
          },
        })
      } else {
        await prisma.like.updateMany({
          where: {
            type: type,
            likeItemId: likeItemId,
            userId: userId,
          },
          data: {
            ...data,
          },
        })
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT) {
          new NotFound('User not found')
        }
      }
      throw error
    }
  }

  static async deleteLike(
    type: string,
    userId: string,
    likeItemId: string,
  ): Promise<void> {
    let item: Post | Comment | null

    if (type === 'P') {
      item = await prisma.post.findUnique({
        where: {
          id: likeItemId,
        },
        rejectOnNotFound: false,
      })

      if (!item) throw new NotFound('Post not found')
    } else {
      item = await prisma.comment.findUnique({
        where: {
          id: likeItemId,
        },
        rejectOnNotFound: false,
      })

      if (!item) throw new NotFound('Comment not found')
    }

    await prisma.like.deleteMany({
      where: {
        userId: userId,
        likeItemId: likeItemId,
        type: type,
      },
    })
  }
}
