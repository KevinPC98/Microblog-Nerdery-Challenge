import { User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { Request, Response } from 'express'
import { ResquestCommentDto } from '../dtos/comment/request/comment.dto'
import { CommentService } from '../services/comment.service'

export async function getComments(req: Request, res: Response): Promise<void> {
  //
}
export async function createComment(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToClass(ResquestCommentDto, req.body)
  await dto.isValid()
  const user = req.user as User
  const postId = req.params.id
  const result = await CommentService.create(
    user.id as string,
    postId as string,
    dto,
  )

  res.status(201).json(result)
}

export async function getComment(req: Request, res: Response): Promise<void> {
  const commentId = req.params.commentId as string

  const result = await CommentService.getComment(commentId)

  res.status(200).json(result)
}

export async function updateComment(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToClass(ResquestCommentDto, req.body)
  await dto.isValid()
  const commentId = req.params.commentId as string

  const result = await CommentService.update(commentId, dto)

  res.status(201).json(result)
}

export async function deleteComment(
  req: Request,
  res: Response,
): Promise<void> {
  const commentId = req.params.commentId as string

  await CommentService.delete(commentId)

  res.status(204).send({ message: 'Comment deleted succesfully' })
}

export async function updateLikeComment(
  req: Request,
  res: Response,
): Promise<void> {
  //
}

export async function deleteLikeComment(
  req: Request,
  res: Response,
): Promise<void> {
  //
}
