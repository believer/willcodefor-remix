/*
  Warnings:

  - A unique constraint covering the columns `[tilId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "tilId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_tilId_key" ON "Post"("tilId");
