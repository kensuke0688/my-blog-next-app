import type { Tag } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type TagResponseBody = Tag;

export type ListTagsResponseBody = TagResponseBody[];

export type TagsErrorResponseBody = {
  error: string;
};

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  try {
    const tags = await prisma.tag.findMany({
      where: query
        ? { name: { contains: query, mode: "insensitive" } }
        : undefined,
      orderBy: { name: "asc" },
      take: 20,
    });

    return Response.json(tags satisfies ListTagsResponseBody);
  } catch (error) {
    console.error("[admin/tags] failed to list tags:", error);

    return Response.json(
      { error: "タグ一覧の取得に失敗しました。" } satisfies TagsErrorResponseBody,
      { status: 500 }
    );
  }
}
