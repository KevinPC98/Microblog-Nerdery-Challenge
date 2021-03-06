import { Comment, Post, User } from '@prisma/client'
import { hashSync } from 'bcryptjs'
import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { NotFound, Unauthorized, BadRequest, LengthRequired } from 'http-errors'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { ResponseCommentDto } from '../dtos/comment/response/comment.dto'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { CommentService } from './comment.service'

describe('CommentService', () => {
  const comment = plainToClass(ResquestCommentDto, {
    content: faker.lorem.paragraph(),
  })
  let createdUser: User
  let createdPost: Post

  const user = plainToClass(CreateUserDto, {
    name: faker.name.firstName(),
    userName: faker.internet.userName(),
    email: faker.internet.email(),
  })
  const post = plainToClass(RequestPostDto, {
    title: faker.name.title(),
    content: faker.lorem.paragraph(),
    isPublic: faker.datatype.boolean(),
  })

  beforeAll(async () => {
    createdUser = await prisma.user.create({
      data: {
        ...user,
        password: hashSync('12345', 10),
        role: 'U',
      },
    })
    createdPost = await prisma.post.create({
      data: {
        ...post,
        userId: createdUser.id,
      },
    })
  })
  afterAll(async () => {
    await prisma.user.delete({
      where: {
        email: createdUser.email,
      },
    })
  })

  describe('read comments', () => {
    const listComments: Comment[] = []
    const commentLength = 15
    beforeAll(async () => {
      for (let i = 0; i < commentLength; i++) {
        const comment = await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            postId: createdPost.id,
            userId: createdUser.id,
          },
        })
        listComments.push(comment)
      }
    })
    afterAll(async () => {
      for (let i = 0; i < commentLength; i++) {
        await prisma.comment.delete({
          where: {
            id: listComments[i].id,
          },
        })
      }
    })

    it("should return a comment's list if take or page are empty", async () => {
      const result = await CommentService.getComments('', '', createdPost.id)
      expect(result).toHaveProperty('comments')
      expect(result).toHaveProperty('pagination')
    })
    it("should return a first page of comment's list", async () => {
      const result = await CommentService.getComments('1', '5', createdPost.id)
      expect(result).toHaveProperty('comments')
      expect(result).toHaveProperty('pagination')
    })

    it("should return a page of comment's list", async () => {
      const result = await CommentService.getComments('2', '5', createdPost.id)
      expect(result).toHaveProperty('comments')
      expect(result).toHaveProperty('pagination')
    })

    it("should return a last page of comment's list", async () => {
      const result = await CommentService.getComments('3', '5', createdPost.id)

      expect(result).toHaveProperty('comments')
      expect(result).toHaveProperty('pagination')
    })

    it('should throw a error if post doent exist', async () => {
      const postId = faker.datatype.uuid()
      const expected = new NotFound('Post does not exist')

      await expect(
        CommentService.getComments('1', '10', postId),
      ).rejects.toThrow(expected)
    })

    it('should throw an error if Page or Take are not numbers', async () => {
      const expected = new BadRequest("Page or take aren't numbers")

      await expect(
        CommentService.getComments('a', 'b', createdPost.id),
      ).rejects.toThrow(expected)
    })

    it('should throw an error if the number of pages was exceeded', async () => {
      const expected = new LengthRequired('Pages limit exceeded')
      const page = '3'
      const take = '10'

      await expect(
        CommentService.getComments(page, take, createdPost.id),
      ).rejects.toThrow(expected)
    })
  })

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const responseComment = await CommentService.create(
        createdUser.id,
        createdPost.id,
        comment,
      )

      expect(responseComment).toHaveProperty('content', comment.content)
      expect(responseComment).toHaveProperty('createdAt')
      expect(responseComment).toHaveProperty('isPublic')
      expect(responseComment).toHaveProperty('countLike')
      expect(responseComment).toHaveProperty('countDisLike')
      expect(responseComment).toHaveProperty('user')
    })

    it('should return an error if the user does not exists', async () => {
      const userId = faker.datatype.uuid()
      const postId = faker.datatype.uuid()

      await expect(
        CommentService.create(userId, postId, comment),
      ).rejects.toThrow(new NotFound("User or post doesn't exist"))
    })
  })

  describe('update', () => {
    const data = plainToClass(ResponseCommentDto, {
      content: faker.lorem.paragraph(),
    })

    let createdComment: Comment

    beforeEach(async () => {
      createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })
    })
    it('should an updated comment ', async () => {
      const commentUpdated = await CommentService.update(
        createdUser.id,
        createdPost.id,
        createdComment.id,
        data,
      )

      expect(commentUpdated).toHaveProperty('content', data.content)
      expect(commentUpdated).toHaveProperty('createdAt')
      expect(commentUpdated).toHaveProperty('isPublic')
      expect(commentUpdated).toHaveProperty('countLike')
      expect(commentUpdated).toHaveProperty('countDisLike')
      expect(commentUpdated).toHaveProperty('user')
    })
    it("should return an error if user try to update a comment that doesn't belong him", async () => {
      const createduserTwo = await prisma.user.create({
        data: {
          name: faker.name.firstName(),
          userName: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashSync('12345', 10),
          role: 'U',
        },
      })

      await expect(
        CommentService.update(
          createduserTwo.id,
          createdPost.id,
          createdComment.id,
          data,
        ),
      ).rejects.toThrow(
        new Unauthorized("User isn't authorized to update this comment"),
      )
    })

    it('should return an error if the post does not exits', async () => {
      const postTwo = plainToClass(RequestPostDto, {
        title: faker.name.title(),
        content: faker.lorem.paragraph(),
        isPublic: faker.datatype.boolean(),
      })
      const createdPostTwo = await prisma.post.create({
        data: {
          ...postTwo,
          userId: createdUser.id,
        },
      })

      await expect(
        CommentService.update(
          createdUser.id,
          createdPostTwo.id,
          createdComment.id,
          data,
        ),
      ).rejects.toThrow(new NotFound('Post does not exist'))
    })

    it('should throw an error if the comment does not exist', async () => {
      const commentId = faker.datatype.uuid()

      await expect(
        CommentService.update(createdUser.id, createdPost.id, commentId, data),
      ).rejects.toThrow(new NotFound('No Comment found'))
    })
  })

  describe('getComment', () => {
    it('should throw an error if the comment does not exist', async () => {
      const postId = faker.datatype.uuid()

      await expect(CommentService.getComment(postId)).rejects.toThrow(
        new NotFound('Comment does not exist'),
      )
    })

    it('should return a comment', async () => {
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })
      const getComment = await CommentService.getComment(createdComment.id)

      expect(getComment).toHaveProperty('content', comment.content)
      expect(getComment).toHaveProperty('isPublic')
      expect(getComment).toHaveProperty('createdAt')
      expect(getComment).toHaveProperty('countLike')
      expect(getComment).toHaveProperty('countDisLike')
      expect(getComment).toHaveProperty('user')
    })
  })

  describe('delete', () => {
    it('should throw an error if the comment does not exist', async () => {
      const commentId = faker.datatype.uuid()

      await expect(
        CommentService.delete(createdUser.id, createdPost.id, commentId),
      ).rejects.toThrow(new NotFound('No Comment found'))
    })

    it("should return an error if user try to delete a commnent that doesn't belong him", async () => {
      const createduserTwo = await prisma.user.create({
        data: {
          name: faker.name.firstName(),
          userName: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashSync('12345', 10),
          role: 'U',
        },
      })
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })
      await expect(
        CommentService.delete(
          createduserTwo.id,
          createdPost.id,
          createdComment.id,
        ),
      ).rejects.toThrow(
        new Unauthorized("User isn't authorized to delete this comment"),
      )
    })

    it('should return an error if the post is invalid', async () => {
      const postTwo = plainToClass(RequestPostDto, {
        title: faker.name.title(),
        content: faker.lorem.paragraph(),
        isPublic: faker.datatype.boolean(),
      })
      const createdPostTwo = await prisma.post.create({
        data: {
          ...postTwo,
          userId: createdUser.id,
        },
      })
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })

      await expect(
        CommentService.delete(
          createdUser.id,
          createdPostTwo.id,
          createdComment.id,
        ),
      ).rejects.toThrow(new Unauthorized('Post is invalid'))
    })

    it('should delete comment sucessfully', async () => {
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })

      expect(
        await CommentService.delete(
          createdUser.id,
          createdPost.id,
          createdComment.id,
        ),
      ).toBe(true)
    })
  })
})
