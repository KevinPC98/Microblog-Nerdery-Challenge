import { execPath } from 'process'
import { plainToClass } from 'class-transformer'
import faker from 'faker'
import { UnprocessableEntity, NotFound } from 'http-errors'
import { hashSync } from 'bcryptjs'
import { User } from '@prisma/client'
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
    it("should return a post's information", async () => {
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
      await expect(await PostService.get(postId)).rejects.toThrow(
        new NotFound("Post doesn't exist"),
      )
    })
  })
})
