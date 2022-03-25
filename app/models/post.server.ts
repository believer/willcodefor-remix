import type { Post } from "@prisma/client";
import { prisma } from "~/db.server";

export function getPost(slug?: Post["slug"]) {
  return prisma.post.findFirst({
    where: { slug },
  });
}

export function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
}
