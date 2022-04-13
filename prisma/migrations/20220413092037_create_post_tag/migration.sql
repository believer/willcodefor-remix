/*
  Warnings:

  - You are about to drop the column `postId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_postId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "postId";

-- CreateTable
CREATE TABLE "Post_Tag" (
    "id" SERIAL NOT NULL,
    "post_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "Post_Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_Tag_post_id_idx" ON "Post_Tag"("post_id");

-- CreateIndex
CREATE INDEX "Post_Tag_tag_id_idx" ON "Post_Tag"("tag_id");

-- AddForeignKey
ALTER TABLE "Post_Tag" ADD CONSTRAINT "Post_Tag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Post_Tag" ADD CONSTRAINT "Post_Tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
