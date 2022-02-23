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
  router.route('/').post(asyncHandler(createPost))

  router
    .route('/:id')
    .post(asyncHandler(getPost))
    .patch(asyncHandler(updatePost))
    .delete(asyncHandler(deletePost))

  router
    .route('/:id/like')
    .patch(asyncHandler(createUpdateLikePost))
    .delete(asyncHandler(deleteLikePost))

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
