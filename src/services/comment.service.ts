import { Unauthorized, NotFound } from 'http-errors'
import { plainToClass } from 'class-transformer'
import { Prisma } from '@prisma/client'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { ResponseCommentDto } from '../dtos/comment/response/comment.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'

export class CommentService {
  //read comments
  //create
  static async create(
    userId: string,
    postId: string,
    data: ResquestCommentDto,
  ): Promise<ResponseCommentDto> {
    try {
      const comment = await prisma.comment.create({
        data: {
          ...data,
          userId,
          postId,
        },
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: comment.id,
          type: 'C',
          like: true,
        },
      })
      const countDislike = await prisma.like.count({
        where: {
          likeItemId: comment.id,
          type: 'C',
          like: true,
        },
      })

      const userFound = await prisma.comment.findUnique({
        where: {
          id: comment.id,
        },
        select: {
          user: {
            select: {
              userName: true,
            },
          },
        },
      })

      return plainToClass(ResponseCommentDto, {
        ...comment,
        countLike: countLike,
        countDisLike: countDislike,
        user: {
          userName: userFound?.user.userName,
        },
      })
    } catch (error) {
      throw new NotFound("User or post doesn't exist")
    }
  }
  //read
  static async getComment(commentId: string): Promise<ResponseCommentDto> {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        rejectOnNotFound: true,
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: commentId,
          type: 'C',
          like: true,
        },
      })
      const countDislike = await prisma.like.count({
        where: {
          likeItemId: commentId,
          type: 'C',
          like: false,
        },
      })

      const userFound = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user: {
            select: {
              userName: true,
            },
          },
        },
      })

      return plainToClass(ResponseCommentDto, {
        ...comment,
        countLike: countLike,
        countDisLike: countDislike,
        user: {
          userName: userFound?.user.userName,
        },
      })
    } catch (error) {
      throw new NotFound('Comment does not exist')
    }
  }
  //update
  static async update(
    commentId: string,
    data: ResquestCommentDto,
  ): Promise<ResponseCommentDto> {
    try {
      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          ...data,
        },
      })

      const countLike = await prisma.like.count({
        where: {
          likeItemId: commentId,
          type: 'C',
          like: true,
        },
      })
      const countDislike = await prisma.like.count({
        where: {
          likeItemId: commentId,
          type: 'C',
          like: false,
        },
      })

      const userFound = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user: {
            select: {
              userName: true,
            },
          },
        },
      })
      return plainToClass(ResponseCommentDto, {
        ...updatedComment,
        countLike,
        countDisLike: countDislike,
        user: userFound?.user,
      })
    } catch (error) {
      throw new NotFound('Comment not found')
    }
  }
  //delete
  static async delete(commentId: string): Promise<boolean> {
    try {
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      })
      await prisma.like.deleteMany({
        where: {
          likeItemId: commentId,
          type: 'C',
        },
      })
      return true
    } catch (error) {
      throw new NotFound('Comment not found')
    }
  }
  //createlike
  //deletelike
}
