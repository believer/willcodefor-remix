/*
  Warnings:

  - A unique constraint covering the columns `[longSlug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_longSlug_key" ON "Post"("longSlug");
