import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/currentUser";
import type {
  PublicComment,
  CommentErrorResponseBody,
} from "@/app/api/posts/[id]/comments/route";

export type UpdateCommentRequestBody = {
  content: string;
};

export type UpdateCommentResponseBody = {
  comment: PublicComment;
};

export type DeleteCommentResponseBody = {
  message: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const MAX_CONTENT_LENGTH = 1000;

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const commentId = Number(id);

  if (Number.isNaN(commentId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CommentErrorResponseBody,
      { status: 400 },
    );
  }

  const currentUser = await getOrCreateCurrentUser();

  if (!currentUser) {
    return Response.json(
      { error: "ログインが必要です。" } satisfies CommentErrorResponseBody,
      { status: 401 },
    );
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    return Response.json(
      {
        error: "コメントが見つかりません。",
      } satisfies CommentErrorResponseBody,
      { status: 404 },
    );
  }

  if (existingComment.userId !== currentUser.id) {
    return Response.json(
      { error: "権限がありません。" } satisfies CommentErrorResponseBody,
      { status: 403 },
    );
  }

  const body: UpdateCommentRequestBody = await request.json();
  const content = body.content?.trim();

  if (!content) {
    return Response.json(
      {
        error: "コメントを入力してください。",
      } satisfies CommentErrorResponseBody,
      { status: 400 },
    );
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return Response.json(
      {
        error: `コメントは${MAX_CONTENT_LENGTH}文字以内で入力してください。`,
      } satisfies CommentErrorResponseBody,
      { status: 400 },
    );
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: { user: { select: { id: true, name: true } } },
  });

  return Response.json({
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: comment.user,
    },
  } satisfies UpdateCommentResponseBody);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const commentId = Number(id);

  if (Number.isNaN(commentId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CommentErrorResponseBody,
      { status: 400 },
    );
  }

  const currentUser = await getOrCreateCurrentUser();

  if (!currentUser) {
    return Response.json(
      { error: "ログインが必要です。" } satisfies CommentErrorResponseBody,
      { status: 401 },
    );
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    return Response.json(
      {
        error: "コメントが見つかりません。",
      } satisfies CommentErrorResponseBody,
      { status: 404 },
    );
  }

  const isCommentOwner = existingComment.userId === currentUser.id;
  const isAdmin = currentUser.authUserId === process.env.BLOG_ADMIN_USER_ID;

  if (!isCommentOwner && !isAdmin) {
    return Response.json(
      { error: "権限がありません。" } satisfies CommentErrorResponseBody,
      { status: 403 },
    );
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return Response.json({
    message: "削除しました。",
  } satisfies DeleteCommentResponseBody);
}
