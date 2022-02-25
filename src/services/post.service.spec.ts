import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { Unauthorized, NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
import { Post, User } from '@prisma/client'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { CreateUserDto } from '../dtos/users/request/create-user.dto'
import { prisma } from '../prisma'
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
      expect(createdPost).toHaveProperty('isPublic', post.isPublic)
      expect(createdPost).toHaveProperty('countLike')
      expect(createdPost).toHaveProperty('countDisLike')
      expect(createdPost).toHaveProperty('createdAt')
      expect(createdPost).toHaveProperty('user')
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
      expect(getPost).toHaveProperty('countLike')
      expect(getPost).toHaveProperty('countDisLike')
      expect(getPost).toHaveProperty('createdAt')
      expect(getPost).toHaveProperty('user')
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

    it('should update a post', async () => {
      const result = await PostService.update(
        createduser.id,
        createdPost.id,
        data,
      )

      expect(result).toHaveProperty('title', data.title)
      expect(result).toHaveProperty('content', data.content)
      expect(result).toHaveProperty('isPublic', data.isPublic)
      expect(result).toHaveProperty('countLike')
      expect(result).toHaveProperty('countDisLike')
      expect(result).toHaveProperty('updatedAt')
      expect(result).toHaveProperty('createdAt')
      expect(result).toHaveProperty('user')
    })
    it("should return an error if user try to update a post that doesn't belong him", async () => {
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
        PostService.update(createduserTwo.id, createdPost.id, data),
      ).rejects.toThrow(
        new Unauthorized("User isn't authorized to update this post"),
      )
    })

    it('should return an error if post doesnt exist', async () => {
      const postId = faker.datatype.uuid()

      await expect(
        PostService.update(createduser.id, postId, data),
      ).rejects.toThrow(new NotFound('No Post found'))
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

      expect(await PostService.delete(createduser.id, createdPost.id)).toBe(
        true,
      )
    })

    it("should return an error if user try to delete a post that doesn't belong him", async () => {
      const createduserTwo = await prisma.user.create({
        data: {
          name: faker.name.firstName(),
          userName: faker.internet.userName(),
          email: faker.internet.email(),
          password: hashSync('12345', 10),
          role: 'U',
        },
      })
      const createdPost = await prisma.post.create({
        data: {
          ...post,
          userId: createduser.id,
        },
      })

      await expect(
        PostService.delete(createduserTwo.id, createdPost.id),
      ).rejects.toThrow(
        new Unauthorized("User isn't authorized to update this post"),
      )
    })

    it('should return a error if the post doesnt exist', async () => {
      const postId = faker.datatype.uuid()

      await expect(PostService.delete(createduser.id, postId)).rejects.toThrow(
        new NotFound('No Post found'),
      )
    })
  })
})
