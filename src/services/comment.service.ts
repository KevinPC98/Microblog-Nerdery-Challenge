import { Unauthorized, NotFound, BadRequest, LengthRequired } from 'http-errors'
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
        throw new BadRequest("Page or take aren't numbers")

      const pageNro = !page ? 1 : parseInt(page)
      const takeNro = !take ? 10 : parseInt(take)

      const totalPages = Math.ceil(countCom / takeNro)
      if (pageNro > totalPages) {
        throw new LengthRequired('Pages limit exceeded')
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

      return plainToClass(ResponseCommentDto, {
        ...comment,
        countLike: countLike,
        countDisLike: countDislike,
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

      return plainToClass(ResponseCommentDto, {
        ...comment,
        countLike: countLike,
        countDisLike: countDislike,
      })
    } catch (error) {
      throw new NotFound('Comment does not exist')
    }
  }
  //update
  static async update(
    userId: string,
    postId: string,
    commentId: string,
    data: ResquestCommentDto,
  ): Promise<ResponseCommentDto> {
    // eslint-disable-next-line no-useless-catch
    try {
      const dataFound = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
          post: {
            select: {
              id: true,
            },
          },
        },
        rejectOnNotFound: true,
      })

      if (dataFound.post.id !== postId) {
        throw new NotFound('Post does not exist')
      }

      if (dataFound.user.id !== userId) {
        throw new Unauthorized("User isn't authorized to update this comment")
      }

      const updatedComment = await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          ...data,
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

      return plainToClass(ResponseCommentDto, {
        ...updatedComment,
        countLike,
        countDisLike: countDislike,
      })
    } catch (error) {
      throw error
    }
  }
  //delete
  static async delete(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<boolean> {
    // eslint-disable-next-line no-useless-catch
    try {
      const dataFound = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
          post: {
            select: {
              id: true,
            },
          },
        },
        rejectOnNotFound: true,
      })

      if (dataFound.post.id !== postId) {
        throw new Unauthorized('Post is invalid')
      }

      if (dataFound.user.id !== userId) {
        throw new Unauthorized("User isn't authorized to delete this comment")
      }

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
      throw error
    }
  }
}
