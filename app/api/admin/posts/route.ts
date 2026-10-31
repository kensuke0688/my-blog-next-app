import { Prisma } from "@/app/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreatePostRequestBody = {
  title: string;
  content: string;
  thumbnailUrl: string;
  userId: number;
  categoryIds: number[];
};

type PostWithCategories = Prisma.PostGetPayload<{
  include: { categories: { include: { category: true } } };
}>;

// JSONでは Date は ISO 文字列になるため、レスポンス型では string として扱う
export type SerializedPost = Omit<PostWithCategories, "createdAt"> & {
  createdAt: string;
};

export type CreatePostResponseBody = SerializedPost;

export type ListPostsResponseBody = SerializedPost[];

export type PostsErrorResponseBody = {
  error: string;
};

function serializePost(post: PostWithCategories): SerializedPost {
  return { ...post, createdAt: post.createdAt.toISOString() };
}

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) {
    return Response.json(
      { error: "認証が必要です。" } satisfies PostsErrorResponseBody,
      { status: 401 }
    );
  }

  try {
    const posts = await prisma.post.findMany({
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(
      posts.map(serializePost) satisfies ListPostsResponseBody
    );
  } catch (error) {
    console.error("[admin/posts] failed to list posts:", error);

    return Response.json(
      { error: "記事一覧の取得に失敗しました。" } satisfies PostsErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  if (!user) {
    return Response.json(
      { error: "認証が必要です。" } satisfies PostsErrorResponseBody,
      { status: 401 }
    );
  }

  try {
    const body: CreatePostRequestBody = await request.json();

    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        thumbnailUrl: body.thumbnailUrl,
        userId: body.userId,
        categories: {
          create: body.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    return Response.json(serializePost(post) satisfies CreatePostResponseBody, {
      status: 201,
    });
  } catch (error) {
    console.error("[admin/posts] failed to create post:", error);

    return Response.json(
      {
        error: "記事の作成に失敗しました。",
      } satisfies PostsErrorResponseBody,
      { status: 500 }
    );
  }
}
