/*
  Warnings:

  - Added the required column `longSlug` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "longSlug" TEXT NOT NULL;
