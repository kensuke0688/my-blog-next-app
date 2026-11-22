import { prisma } from "@/lib/prisma";

export type PublicPost = {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  categories: string[];
  tags: string[];
  content: string;
};

export type ListPublicPostsResponseBody = {
  posts: PublicPost[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag")?.trim();

  const posts = await prisma.post.findMany({
    where: tag
      ? { tags: { some: { tag: { name: { equals: tag, mode: "insensitive" } } } } }
      : undefined,
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      thumbnailUrl: post.thumbnailUrl,
      createdAt: post.createdAt.toISOString(),
      categories: post.categories.map((pc) => pc.category.name),
      tags: post.tags.map((pt) => pt.tag.name),
      content: post.content,
    })),
  } satisfies ListPublicPostsResponseBody);
}
