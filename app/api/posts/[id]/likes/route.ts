import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/currentUser";

export type LikeErrorResponseBody = {
  error: string;
};

export type GetLikeStatusResponseBody = {
  likeCount: number;
  likedByMe: boolean;
};

export type ToggleLikeResponseBody = {
  liked: boolean;
  likeCount: number;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies LikeErrorResponseBody,
      { status: 400 },
    );
  }

  const currentUser = await getOrCreateCurrentUser();

  const [likeCount, myLike] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    currentUser
      ? prisma.like.findUnique({
          where: { postId_userId: { postId, userId: currentUser.id } },
        })
      : null,
  ]);

  return Response.json({
    likeCount,
    likedByMe: myLike !== null,
  } satisfies GetLikeStatusResponseBody);
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies LikeErrorResponseBody,
      { status: 400 },
    );
  }

  const currentUser = await getOrCreateCurrentUser();

  if (!currentUser) {
    return Response.json(
      {
        error: "いいねするにはログインが必要です。",
      } satisfies LikeErrorResponseBody,
      { status: 401 },
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    return Response.json(
      { error: "記事が見つかりません。" } satisfies LikeErrorResponseBody,
      { status: 404 },
    );
  }

  const existingLike = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId: currentUser.id } },
  });

  let liked: boolean;
  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { postId, userId: currentUser.id } });
    liked = true;
  }

  const likeCount = await prisma.like.count({ where: { postId } });

  return Response.json({
    liked,
    likeCount,
  } satisfies ToggleLikeResponseBody);
}
