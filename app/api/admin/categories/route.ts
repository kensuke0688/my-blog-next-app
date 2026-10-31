import type { Category } from "@/app/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CreateCategoryRequestBody = {
  name: string;
};

export type CategoryResponseBody = Category;

export type ListCategoriesResponseBody = CategoryResponseBody[];

export type CategoriesErrorResponseBody = {
  error: string;
};

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) {
    return Response.json(
      { error: "認証が必要です。" } satisfies CategoriesErrorResponseBody,
      { status: 401 }
    );
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    return Response.json(categories satisfies ListCategoriesResponseBody);
  } catch (error) {
    console.error("[admin/categories] failed to list categories:", error);

    return Response.json(
      {
        error: "カテゴリー一覧の取得に失敗しました。",
      } satisfies CategoriesErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireUser(request);
  if (!user) {
    return Response.json(
      { error: "認証が必要です。" } satisfies CategoriesErrorResponseBody,
      { status: 401 }
    );
  }

  try {
    const body: CreateCategoryRequestBody = await request.json();

    const category = await prisma.category.create({
      data: { name: body.name },
    });

    return Response.json(category satisfies CategoryResponseBody, {
      status: 201,
    });
  } catch (error) {
    console.error("[admin/categories] failed to create category:", error);

    return Response.json(
      {
        error: "カテゴリーの作成に失敗しました。",
      } satisfies CategoriesErrorResponseBody,
      { status: 500 }
    );
  }
}
