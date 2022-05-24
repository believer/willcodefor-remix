-- CreateTable
CREATE TABLE "Views" (
    "id" SERIAL NOT NULL,
    "post_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL,

    CONSTRAINT "Views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Views_post_id_idx" ON "Views"("post_id");

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
