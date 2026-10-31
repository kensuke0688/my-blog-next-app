import { Prisma } from "@/app/generated/prisma/client";
import type { SerializedPost } from "@/app/api/admin/posts/route";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdatePostRequestBody = {
  title: string;
  content: string;
  thumbnailUrl: string;
  userId: number;
  categoryIds: number[];
};

type PostWithCategories = Prisma.PostGetPayload<{
  include: { categories: { include: { category: true } } };
}>;

export type GetPostResponseBody = SerializedPost;

export type UpdatePostResponseBody = SerializedPost;

export type PostErrorResponseBody = {
  error: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function serializePost(post: PostWithCategories): SerializedPost {
  return { ...post, createdAt: post.createdAt.toISOString() };
}

export async function GET(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies PostErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { categories: { include: { category: true } } },
    });

    if (!post) {
      return Response.json(
        { error: "記事が見つかりません。" } satisfies PostErrorResponseBody,
        { status: 404 }
      );
    }

    return Response.json(serializePost(post) satisfies GetPostResponseBody);
  } catch (error) {
    console.error("[admin/posts/:id] failed to get post:", error);

    return Response.json(
      { error: "記事の取得に失敗しました。" } satisfies PostErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies PostErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const body: UpdatePostRequestBody = await request.json();

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return Response.json(
        { error: "記事が見つかりません。" } satisfies PostErrorResponseBody,
        { status: 404 }
      );
    }

    const [, post] = await prisma.$transaction([
      prisma.postCategory.deleteMany({ where: { postId } }),
      prisma.post.update({
        where: { id: postId },
        data: {
          title: body.title,
          content: body.content,
          thumbnailUrl: body.thumbnailUrl,
          userId: body.userId,
          categories: {
            create: body.categoryIds.map((categoryId) => ({ categoryId })),
          },
        },
        include: { categories: { include: { category: true } } },
      }),
    ]);

    return Response.json(serializePost(post) satisfies UpdatePostResponseBody);
  } catch (error) {
    console.error("[admin/posts/:id] failed to update post:", error);

    return Response.json(
      { error: "記事の更新に失敗しました。" } satisfies PostErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies PostErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return Response.json(
        { error: "記事が見つかりません。" } satisfies PostErrorResponseBody,
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id: postId } });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[admin/posts/:id] failed to delete post:", error);

    return Response.json(
      { error: "記事の削除に失敗しました。" } satisfies PostErrorResponseBody,
      { status: 500 }
    );
  }
}
