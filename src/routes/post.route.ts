import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import passport from 'passport'
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  createUpdateLikePost,
  deleteLikePost,
} from '../controllers/post.controller'

import {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  updateLikeComment,
  deleteLikeComment,
} from '../controllers/comment.controller'

const router = express.Router()

export function postRoutes(): Router {
  router
    .route('/')
    .post(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(createPost),
    )

  router
    .route('/:id')
    .get(asyncHandler(getPost))
    .patch(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(updatePost),
    )
    .delete(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(deletePost),
    )

  router
    .route('/:id/like')
    .patch(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(createUpdateLikePost),
    )
    .delete(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(deleteLikePost),
    )

  router
    .route('/:id/comments')
    .get(asyncHandler(getComments))
    .post(asyncHandler(createComment))

  router
    .route('/:id/comments/:commentId')
    .get(asyncHandler(getComment))
    .patch(asyncHandler(updateComment))
    .delete(asyncHandler(deleteComment))

  router
    .route('/:id/comments/:commentId/like')
    .patch(asyncHandler(updateLikeComment))
    .delete(asyncHandler(deleteLikeComment))

  return router
}
