import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
import { Post, User } from '@prisma/client'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
import { PostService } from './post.service'

describe('PostService', () => {
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

  describe('Create Post', () => {
    it('should create a post successfully', async () => {
      const createdPost = await PostService.create(createduser.id, post)

      expect(createdPost).toHaveProperty('title', post.title)
      expect(createdPost).toHaveProperty('content', post.content)
      expect(createdPost).toHaveProperty('createdAt')
      expect(createdPost).toHaveProperty('isPublic', post.isPublic)
    })
    it("should return an error if user doesn't exist", async () => {
      const userId = faker.datatype.uuid()

      await expect(PostService.create(userId, post)).rejects.toThrow(
        new NotFound("user doesn't exist"),
      )
    })
  })

  describe('get post', () => {
    it("should get a post's information", async () => {
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })
      const getPost = await PostService.get(createdPost.id)

      expect(getPost).toHaveProperty('title', post.title)
      expect(getPost).toHaveProperty('content', post.content)
      expect(getPost).toHaveProperty('isPublic', post.isPublic)
      expect(getPost).toHaveProperty('createdAt')
      expect(getPost).toHaveProperty('countLike')
      expect(getPost).toHaveProperty('countDislike')
    })
    it("should return a error if the post doesn't exist", async () => {
      const postId = faker.datatype.uuid()
      await expect(PostService.get(postId)).rejects.toThrow(
        new NotFound("Post doesn't exist"),
      )
    })
  })

  describe('update post', () => {
    const data = plainToClass(RequestPostDto, {
      title: faker.name.title(),
      content: faker.lorem.paragraph(),
      isPublic: faker.datatype.boolean(),
    })

    it('should update a post', async () => {
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })
      const result = await PostService.update(createdPost.id, data)

      expect(result).toHaveProperty('title', data.title)
      expect(result).toHaveProperty('content', data.content)
      expect(result).toHaveProperty('isPublic', data.isPublic)
      expect(result).toHaveProperty('updatedAt')
      expect(result).toHaveProperty('createdAt')
    })

    it('should return an error if post doesnt exist', async () => {
      const postId = faker.datatype.uuid()

      await expect(PostService.update(postId, data)).rejects.toThrow(
        new NotFound('Post not found'),
      )
    })
  })

  describe('delete post', () => {
    it('should delete post sucessfully', async () => {
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })

      expect(await PostService.delete(createdPost.id)).toBe(true)
    })
    it('should return a error if the post doesnt exist', async () => {
      const postId = faker.datatype.uuid()

      await expect(PostService.delete(postId)).rejects.toThrow(
        new NotFound('Post not found'),
      )
    })
  })

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

      const result = await PostService.createUpdateLike(
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

      const result = await PostService.createUpdateLike(
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
        PostService.createUpdateLike(userId, createdPost.id, data),
      ).rejects.toThrow()
    })

    it("should return a error if the  post doesn't exist", async () => {
      const data = plainToClass(RequestLiketDto, {
        like: faker.datatype.boolean(),
      })

      const postId = faker.datatype.uuid()

      await expect(
        PostService.createUpdateLike(createduser.id, postId, data),
      ).rejects.toThrow(new NotFound('Post not found'))
    })
  })

  describe('delete like', () => {
    it('should delete like sucessfully', async () => {
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })

      await prisma.like.create({
        data: {
          like: faker.datatype.boolean(),
          userId: createduser.id,
          type: 'P',
          likeItemId: createdPost.id,
        },
      })

      expect(
        await PostService.deleteLike(createduser.id, createdPost.id),
      ).toBeUndefined()
    })
    it('should return a error if the like doesnt exist', async () => {
      const postId = faker.datatype.uuid()
      const userId = faker.datatype.uuid()

      await expect(PostService.deleteLike(userId, postId)).rejects.toThrow()
    })
  })
})
