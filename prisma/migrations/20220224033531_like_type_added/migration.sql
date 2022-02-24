/*
  Warnings:

  - Added the required column `type` to the `likes` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "likes" ADD COLUMN     "type" TEXT NOT NULL;

