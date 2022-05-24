/*
  Warnings:

  - You are about to drop the `Views` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Views" DROP CONSTRAINT "Views_post_id_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Views";
