import type { PublicPost } from "@/app/api/posts/route";
import { prisma } from "@/lib/prisma";

export type GetPublicPostResponseBody = {
  post: PublicPost;
};

export type PublicPostErrorResponseBody = {
  error: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies PublicPostErrorResponseBody,
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) {
    return Response.json(
      { error: "記事が見つかりません。" } satisfies PublicPostErrorResponseBody,
      { status: 404 },
    );
  }

  return Response.json({
    post: {
      id: post.id,
      title: post.title,
      thumbnailUrl: post.thumbnailUrl,
      createdAt: post.createdAt.toISOString(),
      categories: post.categories.map((pc) => pc.category.name),
      tags: post.tags.map((pt) => pt.tag.name),
      content: post.content,
      authorId: post.userId,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    },
  } satisfies GetPublicPostResponseBody);
}
