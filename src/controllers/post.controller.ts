import { User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { NotFound } from 'http-errors'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
import { RequestPostDto } from '../dtos/post/request/requestpost.dto'
import { LikeService } from '../services/like.service'
import { PostService } from '../services/post.service'

export async function createPost(req: Request, res: Response): Promise<void> {
  const dto = plainToClass(RequestPostDto, req.body)
  await dto.isValid()
  const user = req.user as User
  const result = await PostService.create(user.id, dto)

  res.status(201).json(result)
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const postId = req.params.id as string

  const result = await PostService.get(postId)

  res.status(200).json(result)
}
export async function updatePost(req: Request, res: Response): Promise<void> {
  const dto = plainToClass(RequestPostDto, req.body)
  await dto.isValid()
  const postId = req.params.id as string
  const user = req.user as User

  const result = await PostService.update(user.id, postId, dto)

  res.status(201).json(result)
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.id as string
  const user = req.user as User

  await PostService.delete(user.id, postId)

  res.status(204).end()
}

export async function createUpdateLikePost(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToClass(RequestLiketDto, req.body)
  await dto.isValid()
  const user = req.user as User

  const postId = req.params.id as string

  await LikeService.createUpdateLike('P', user.id, postId, dto)

  res.status(204).end()
}

export async function deleteLikePost(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user as User
  const postId = req.params.id as string

  await LikeService.deleteLike('P', user.id, postId)

  res.status(204).end()
}
