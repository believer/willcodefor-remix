-- CreateTable
CREATE TABLE "Post_View" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,

    CONSTRAINT "Post_View_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_View_post_id_idx" ON "Post_View"("post_id");

-- AddForeignKey
ALTER TABLE "Post_View" ADD CONSTRAINT "Post_View_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
