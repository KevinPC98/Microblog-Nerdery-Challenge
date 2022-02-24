/*
  Warnings:

  - Added the required column `like` to the `likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likeItemId` to the `likes` table without a default value. This is not possible if the table is not empty.

*/


-- AlterTable
ALTER TABLE "likes" ADD COLUMN     "like" BOOLEAN NOT NULL,
ADD COLUMN     "likeItemId" TEXT NOT NULL;
