import type { Category } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type UpdateCategoryRequestBody = {
  name: string;
};

export type CategoryResponseBody = Category;

export type GetCategoryResponseBody = CategoryResponseBody;

export type UpdateCategoryResponseBody = CategoryResponseBody;

export type CategoryErrorResponseBody = {
  error: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CategoryErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return Response.json(
        { error: "カテゴリーが見つかりません。" } satisfies CategoryErrorResponseBody,
        { status: 404 }
      );
    }

    return Response.json(category satisfies GetCategoryResponseBody);
  } catch (error) {
    console.error("[admin/categories/:id] failed to get category:", error);

    return Response.json(
      { error: "カテゴリーの取得に失敗しました。" } satisfies CategoryErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CategoryErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const body: UpdateCategoryRequestBody = await request.json();

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existing) {
      return Response.json(
        { error: "カテゴリーが見つかりません。" } satisfies CategoryErrorResponseBody,
        { status: 404 }
      );
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name: body.name },
    });

    return Response.json(category satisfies UpdateCategoryResponseBody);
  } catch (error) {
    console.error("[admin/categories/:id] failed to update category:", error);

    return Response.json(
      { error: "カテゴリーの更新に失敗しました。" } satisfies CategoryErrorResponseBody,
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { id } = await params;
  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return Response.json(
      { error: "不正なIDです。" } satisfies CategoryErrorResponseBody,
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existing) {
      return Response.json(
        { error: "カテゴリーが見つかりません。" } satisfies CategoryErrorResponseBody,
        { status: 404 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[admin/categories/:id] failed to delete category:", error);

    return Response.json(
      { error: "カテゴリーの削除に失敗しました。" } satisfies CategoryErrorResponseBody,
      { status: 500 }
    );
  }
}
