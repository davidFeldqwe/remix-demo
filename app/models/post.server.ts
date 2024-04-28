import { prisma } from "~/db.server";
import type { Post } from "@prisma/client";

type partialPost = Pick<Post, "slug" | "title" | "markdown">;

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function createPost(post: partialPost) {
  return prisma.post.create({ data: post });
}

export async function editPost(postId: string, newPost: partialPost) {
  return prisma.post.update({
    where: {
      slug: postId,
    },
    data: newPost,
  });
}
export async function deletePost(postId: string) {
  return prisma.post.delete({
    where: {
      slug: postId,
    },
  });
}
