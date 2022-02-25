import { User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { RequestLiketDto } from '../dtos/like/request/requestlike.dto'
import { LikeService } from '../services/like.service'

export async function getComments(req: Request, res: Response): Promise<void> {
  //
}
export async function createComment(
  req: Request,
  res: Response,
): Promise<void> {
  //
}

export async function getComment(req: Request, res: Response): Promise<void> {
  //
}

export async function updateComment(
  req: Request,
  res: Response,
): Promise<void> {
  //
}

export async function deleteComment(
  req: Request,
  res: Response,
): Promise<void> {
  //
}

export async function updateLikeComment(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToClass(RequestLiketDto, req.body)
  await dto.isValid()
  const user = req.user as User

  const commentId = req.params.commentId as string

  const result = await LikeService.createUpdateLike(
    'C',
    user.id,
    commentId,
    dto,
  )

  res.status(201).json(result)
}

export async function deleteLikeComment(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user as User
  const commentId = req.params.commentId as string

  await LikeService.deleteLike('C', user.id, commentId)

  res.status(204).end()
}
