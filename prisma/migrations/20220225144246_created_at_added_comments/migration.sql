/*
  Warnings:

  - Added the required column `updated_at` to the `comments` table without a default value. This is not possible if the table is not empty.

*/


-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;


-- InsertUser
INSERT INTO "users" ("id", "name", "user_name","email", "password", "is_name_public", "is_email_public","is_active",  "verified_at", "updated_at", "created_at", "role") VALUES
('57be8001-27a5-409d-bc4f-ff5630ee88bb', 'Felipe', 'user1', 'kevinparedes@ravn.co', '$2a$10$ziRoWPWeqYPZZz5tP0hd4eIPFlYZAtQ2wTe1YHIbdp4cwhF.4Kz4e', false,false,false, NOW(),NOW(),NOW(),'U')