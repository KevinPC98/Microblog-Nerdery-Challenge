import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
import { Comment, Post, User } from '@prisma/client'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { LikeService } from './like.service'

describe('LikeService', () => {
  const post = plainToClass(RequestPostDto, {
    title: faker.name.title(),
    content: faker.lorem.paragraph(),
    isPublic: faker.datatype.boolean(),
  })

  let createduser: User

  beforeEach(async () => {
    const user = plainToClass(CreateUserDto, {
      name: faker.name.firstName(),
      userName: faker.internet.userName(),
      email: faker.internet.email(),
    })
    createduser = await prisma.user.create({
      data: {
        ...user,
        password: hashSync('12345', 10),
        role: 'U',
      },
    })
  })

  afterEach(async () => {
    await prisma.user.delete({
      where: {
        email: createduser.email,
      },
    })
  })

  describe('LikePost', () => {
    describe('create or update like', () => {
      let createdPost: Post
      beforeEach(async () => {
        createdPost = await prisma.post.create({
          data: {
            ...post,
            userId: createduser.id,
          },
        })
      })

      afterEach(async () => {
        await prisma.post.delete({
          where: {
            id: createdPost.id,
          },
        })
      })

      it('should create a like', async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        const result = await LikeService.createUpdateLike(
          'P',
          createduser.id,
          createdPost.id,
          data,
        )

        expect(result).toBeUndefined()
      })

      it('should update a like', async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        await prisma.like.create({
          data: {
            ...data,
            type: 'P',
            userId: createduser.id,
            likeItemId: createdPost.id,
          },
        })

        const result = await LikeService.createUpdateLike(
          'P',
          createduser.id,
          createdPost.id,
          data,
        )

        expect(result).toBeUndefined()
      })

      it("should return a error if the user doesn't exist", async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })
        const userId = faker.datatype.uuid()

        await expect(
          LikeService.createUpdateLike('P', userId, createdPost.id, data),
        ).rejects.toThrow()
      })

      it("should return a error if the  post doesn't exist", async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        const postId = faker.datatype.uuid()

        await expect(
          LikeService.createUpdateLike('P', createduser.id, postId, data),
        ).rejects.toThrow(new NotFound('Post not found'))
      })
    })

    describe('delete like', () => {
      let createdPost: Post
      beforeEach(async () => {
        createdPost = await prisma.post.create({
          data: {
            ...post,
            userId: createduser.id,
          },
        })
      })

      afterEach(async () => {
        await prisma.post.delete({
          where: {
            id: createdPost.id,
          },
        })
      })
      it('should delete like sucessfully', async () => {
        expect(
          await LikeService.deleteLike('P', createduser.id, createdPost.id),
        ).toBeUndefined()
      })

      it('should return a error if the post doesnt exist', async () => {
        const postId = faker.datatype.uuid()

        await expect(
          LikeService.deleteLike('P', createduser.id, postId),
        ).rejects.toThrow()
      })
    })
  })

  describe('LikeComment', () => {
    let createdPost: Post
    beforeEach(async () => {
      createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })
    })

    afterEach(async () => {
      await prisma.post.delete({
        where: {
          id: createdPost.id,
        },
      })
    })
    const comment = plainToClass(ResquestCommentDto, {
      content: faker.lorem.paragraph(),
    })
    describe('create or update like', () => {
      let createdComment: Comment
      beforeEach(async () => {
        createdComment = await prisma.comment.create({
          data: {
            ...comment,
            userId: createduser.id,
            postId: createdPost.id,
          },
        })
      })

      afterEach(async () => {
        await prisma.comment.delete({
          where: {
            id: createdComment.id,
          },
        })
      })

      it('should create a like', async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        const result = await LikeService.createUpdateLike(
          'C',
          createduser.id,
          createdComment.id,
          data,
        )

        expect(result).toBeUndefined()
      })
      it('should update a like', async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        await prisma.like.create({
          data: {
            ...data,
            type: 'C',
            userId: createduser.id,
            likeItemId: createdComment.id,
          },
        })

        const result = await LikeService.createUpdateLike(
          'C',
          createduser.id,
          createdComment.id,
          data,
        )

        expect(result).toBeUndefined()
      })

      it("should return a error if the user doesn't exist", async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })
        const userId = faker.datatype.uuid()

        await expect(
          LikeService.createUpdateLike('C', userId, createdComment.id, data),
        ).rejects.toThrow()
      })

      it("should return a error if the comment doesn't exist", async () => {
        const data = plainToClass(RequestLiketDto, {
          like: faker.datatype.boolean(),
        })

        const commentId = faker.datatype.uuid()

        await expect(
          LikeService.createUpdateLike('C', createduser.id, commentId, data),
        ).rejects.toThrow(new NotFound('Comment not found'))
      })
    })

    describe('delete like', () => {
      let createdComment: Comment
      beforeEach(async () => {
        createdComment = await prisma.comment.create({
          data: {
            ...comment,
            userId: createduser.id,
            postId: createdPost.id,
          },
        })
      })

      afterEach(async () => {
        await prisma.comment.delete({
          where: {
            id: createdComment.id,
          },
        })
      })
      it('should delete like sucessfully', async () => {
        expect(
          await LikeService.deleteLike('C', createduser.id, createdComment.id),
        ).toBeUndefined()
      })

      it('should return a error if the comment doesnt exist', async () => {
        const commentId = faker.datatype.uuid()

        await expect(
          LikeService.deleteLike('C', createduser.id, commentId),
        ).rejects.toThrow()
      })
    })
  })
})
