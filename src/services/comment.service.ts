import { NotFound } from 'http-errors'
import { plainToClass } from 'class-transformer'
import { Prisma } from '@prisma/client'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { ResponseCommentDto } from '../dtos/comment/response/comment.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { ListCommentDto } from '../dtos/comment/response/list-comment.dto'

export class CommentService {
  //read comments
  static async getComments(
    page: string,
    take: string,
    postId: string,
  ): Promise<ListCommentDto> {
    // eslint-disable-next-line no-useless-catch
    try {
      const postFound = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        rejectOnNotFound: false,
      })
      if (!postFound) {
        throw new NotFound('Post does not exist')
      }
      const countCom = await prisma.comment.count({
        where: {
          postId,
        },
      })

      const isNumber = /^0{0}[0-9]*$/
      if (!isNumber.test(page) || !isNumber.test(take))
        throw new Error("Page or take aren't numbers")

      const pageNro = !page ? 1 : parseInt(page)
      const takeNro = !take ? 10 : parseInt(take)

      const totalPages = Math.ceil(countCom / takeNro)
      if (pageNro > totalPages) {
        throw new Error('Pages limit exceeded')
      }

      const comments = await prisma.comment.findMany({
        skip: takeNro * (pageNro - 1),
        take: takeNro,
        where: {
          postId,
        },
        select: {
          id: true,
          content: true,
          isPublic: true,
          user: {
            select: {
              userName: true,
            },
          },
        },
      })
      const nextPage = pageNro === totalPages ? null : pageNro + 1
      const previousPage = pageNro === 1 ? null : pageNro - 1

      return plainToClass(ListCommentDto, {
        comments,
        pagination: {
          totalPages,
          itemsPerPage: takeNro,
          totalItems: countCom,
          currentPage: pageNro,
          nextPage,
          previousPage,
        },
      })
    } catch (error) {
      throw error
    }
  }
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
