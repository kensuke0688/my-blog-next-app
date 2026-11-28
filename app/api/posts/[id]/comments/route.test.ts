import { describe, test, expect, vi, beforeEach } from "vitest";

const { getOrCreateCurrentUserMock, prismaMock } = vi.hoisted(() => ({
  getOrCreateCurrentUserMock: vi.fn(),
  prismaMock: {
    comment: {
      create: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/currentUser", () => ({
  getOrCreateCurrentUser: getOrCreateCurrentUserMock,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return { json: async () => body } as unknown as Request;
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/posts/[id]/comments", () => {
  beforeEach(() => {
    getOrCreateCurrentUserMock.mockReset();
    prismaMock.comment.create.mockReset();
    prismaMock.post.findUnique.mockReset();
  });

  test("不正なIDなら400を返す", async () => {
    const res = await POST(
      makeRequest({ content: "test" }),
      makeContext("abc"),
    );
    expect(res.status).toBe(400);
  });

  test("未ログインなら401を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(null);

    const res = await POST(makeRequest({ content: "test" }), makeContext("1"));

    expect(res.status).toBe(401);
  });

  test("空のコメントなら400を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue({ id: 1 });

    const res = await POST(makeRequest({ content: "   " }), makeContext("1"));

    expect(res.status).toBe(400);
  });

  test("1000文字を超えるコメントなら400を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue({ id: 1 });

    const res = await POST(
      makeRequest({ content: "a".repeat(1001) }),
      makeContext("1"),
    );

    expect(res.status).toBe(400);
  });

  test("記事が存在しなければ404を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue({ id: 1 });
    prismaMock.post.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ content: "test" }), makeContext("1"));

    expect(res.status).toBe(404);
  });

  test("ログイン済みで記事が存在すればコメントを作成し201を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue({ id: 1 });
    prismaMock.post.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.comment.create.mockResolvedValue({
      id: 10,
      content: "test",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      user: { id: 1, name: "テストユーザー" },
    });

    const res = await POST(makeRequest({ content: "test" }), makeContext("1"));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.comment).toEqual({
      id: 10,
      content: "test",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      user: { id: 1, name: "テストユーザー" },
    });
    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { content: "test", postId: 1, userId: 1 },
      }),
    );
  });
});
