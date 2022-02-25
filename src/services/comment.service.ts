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

      return plainToClass(ResponseCommentDto, comment)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('User or Post not found')
          default:
            throw error
        }
      }

      throw error
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
          like: true,
        },
      })
      const countDislike = await prisma.like.count({
        where: {
          likeItemId: commentId,
          like: true,
        },
      })

      return plainToClass(ResponseCommentDto, {
        ...comment,
        countLike,
        countDislike,
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

      return plainToClass(ResponseCommentDto, updatedComment)
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
