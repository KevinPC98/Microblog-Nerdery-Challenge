import { Post, User } from '@prisma/client'
import { hashSync } from 'bcryptjs'
import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { UnprocessableEntity, NotFound } from 'http-errors'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { ResponseCommentDto } from '../dtos/comment/response/comment.dto'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { CommentService } from './comment.service'

describe('CommentService', () => {
  let createdUser: User
  let createdPost: Post
  const comment = plainToClass(ResquestCommentDto, {
    content: faker.lorem.paragraph(),
  })
  beforeEach(async () => {
    const user = plainToClass(CreateUserDto, {
      name: faker.name.firstName(),
      userName: faker.internet.userName(),
      email: faker.internet.email(),
    })
    createdUser = await prisma.user.create({
      data: {
        ...user,
        password: hashSync('12345', 10),
        role: 'U',
      },
    })
    const post = plainToClass(RequestPostDto, {
      title: faker.name.title(),
      content: faker.lorem.paragraph(),
      isPublic: faker.datatype.boolean(),
    })
    createdPost = await prisma.post.create({
      data: {
        ...post,
        userId: createdUser.id,
      },
    })
  })
  describe('read comments', () => {
    //
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
      expect(responseComment).toHaveProperty('countDislike')
      expect(responseComment).toHaveProperty('user')
    })

    it('should return an error if the user does not exists', async () => {
      const userId = faker.datatype.uuid()
      const postId = createdPost.id
      await expect(
        CommentService.create(userId, postId, comment),
      ).rejects.toThrow(new NotFound('User do not exist'))
    })

    it('should return an error if the post does not exist', async () => {
      const userId = createdUser.id
      const postId = faker.datatype.uuid()

      await expect(
        CommentService.create(userId, postId, comment),
      ).rejects.toThrow(new NotFound('Post do not exist'))
    })
  })
  describe('update', () => {
    const data = plainToClass(ResponseCommentDto, {
      content: faker.lorem.paragraph(),
    })

    it('should an updated comment ', async () => {
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })
      const commentUpdated = await CommentService.update(
        createdComment.id,
        data,
      )

      expect(commentUpdated).toHaveProperty('content', comment.content)
      expect(commentUpdated).toHaveProperty('createdAt')
      expect(commentUpdated).toHaveProperty('isPublic')
      expect(commentUpdated).toHaveProperty('countLike')
      expect(commentUpdated).toHaveProperty('countDislike')
      expect(commentUpdated).toHaveProperty('user')
    })

    it('should throw an error if the comment does not exist', async () => {
      const commentId = faker.datatype.uuid()

      await expect(CommentService.update(commentId, data)).rejects.toThrow(
        new NotFound('Comment not found'),
      )
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
      expect(getComment).toHaveProperty('countDislike')
      expect(getComment).toHaveProperty('user')
    })
  })
  describe('delete', () => {
    it('should throw an error if the comment does not exist', async () => {
      const commentId = faker.datatype.uuid()

      await expect(CommentService.delete(commentId)).rejects.toThrow(
        new NotFound('Comment not found'),
      )
    })

    it('should delete comment sucessfully', async () => {
      const createdComment = await prisma.comment.create({
        data: {
          ...comment,
          userId: createdUser.id,
          postId: createdPost.id,
        },
      })

      expect(await CommentService.delete(createdComment.id)).toBeTrue()
    })
  })
})
