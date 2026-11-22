import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/currentUser";

export type PublicComment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
};

export type ListCommentsResponseBody = {
  comments: PublicComment[];
};

export type CreateCommentRequestBody = {
  content: string;
};

export type CreateCommentResponseBody = {
  comment: PublicComment;
};

export type CommentErrorResponseBody = {
  error: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_CONTENT_LENGTH = 1000;

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CommentErrorResponseBody,
      { status: 400 }
    );
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: comment.user,
    })),
  } satisfies ListCommentsResponseBody);
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CommentErrorResponseBody,
      { status: 400 }
    );
  }

  const currentUser = await getOrCreateCurrentUser();

  if (!currentUser) {
    return Response.json(
      { error: "コメントするにはログインが必要です。" } satisfies CommentErrorResponseBody,
      { status: 401 }
    );
  }

  const body: CreateCommentRequestBody = await request.json();
  const content = body.content?.trim();

  if (!content) {
    return Response.json(
      { error: "コメントを入力してください。" } satisfies CommentErrorResponseBody,
      { status: 400 }
    );
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return Response.json(
      {
        error: `コメントは${MAX_CONTENT_LENGTH}文字以内で入力してください。`,
      } satisfies CommentErrorResponseBody,
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    return Response.json(
      { error: "記事が見つかりません。" } satisfies CommentErrorResponseBody,
      { status: 404 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId: currentUser.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return Response.json(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: comment.user,
      },
    } satisfies CreateCommentResponseBody,
    { status: 201 }
  );
}
