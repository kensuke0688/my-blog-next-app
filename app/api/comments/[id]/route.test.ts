import { describe, test, expect, vi, beforeEach } from "vitest";

const { getOrCreateCurrentUserMock, prismaMock } = vi.hoisted(() => ({
  getOrCreateCurrentUserMock: vi.fn(),
  prismaMock: {
    comment: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/currentUser", () => ({
  getOrCreateCurrentUser: getOrCreateCurrentUserMock,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { PATCH, DELETE } from "./route";

function makeRequest(body: unknown = {}) {
  return { json: async () => body } as unknown as Request;
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

const OWNER = { id: 1, authUserId: "owner-auth-id" };
const OTHER_USER = { id: 2, authUserId: "other-auth-id" };
const ADMIN = { id: 3, authUserId: "admin-auth-id" };

beforeEach(() => {
  getOrCreateCurrentUserMock.mockReset();
  prismaMock.comment.findUnique.mockReset();
  prismaMock.comment.update.mockReset();
  prismaMock.comment.delete.mockReset();
  process.env.BLOG_ADMIN_USER_ID = "admin-auth-id";
});

describe("PATCH /api/comments/[id]", () => {
  test("不正なIDなら400を返す", async () => {
    const res = await PATCH(
      makeRequest({ content: "new" }),
      makeContext("abc"),
    );
    expect(res.status).toBe(400);
  });

  test("未ログインなら401を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ content: "new" }), makeContext("1"));

    expect(res.status).toBe(401);
  });

  test("コメントが存在しなければ404を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ content: "new" }), makeContext("1"));

    expect(res.status).toBe(404);
  });

  test("本人以外が編集しようとすると403を返す(管理者でも編集はできない)", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(ADMIN);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await PATCH(makeRequest({ content: "new" }), makeContext("1"));

    expect(res.status).toBe(403);
    expect(prismaMock.comment.update).not.toHaveBeenCalled();
  });

  test("本人が空のコメントで更新しようとすると400を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await PATCH(makeRequest({ content: "  " }), makeContext("1"));

    expect(res.status).toBe(400);
  });

  test("本人が1000文字を超えるコメントで更新しようとすると400を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await PATCH(
      makeRequest({ content: "a".repeat(1001) }),
      makeContext("1"),
    );

    expect(res.status).toBe(400);
  });

  test("本人であれば更新でき200を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });
    prismaMock.comment.update.mockResolvedValue({
      id: 1,
      content: "updated",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
      user: { id: OWNER.id, name: "owner" },
    });

    const res = await PATCH(
      makeRequest({ content: "updated" }),
      makeContext("1"),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comment.content).toBe("updated");
  });
});

describe("DELETE /api/comments/[id]", () => {
  test("不正なIDなら400を返す", async () => {
    const res = await DELETE(makeRequest(), makeContext("abc"));
    expect(res.status).toBe(400);
  });

  test("未ログインなら401を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(null);

    const res = await DELETE(makeRequest(), makeContext("1"));

    expect(res.status).toBe(401);
  });

  test("コメントが存在しなければ404を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest(), makeContext("1"));

    expect(res.status).toBe(404);
  });

  test("本人でも管理者でもない場合は403を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OTHER_USER);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await DELETE(makeRequest(), makeContext("1"));

    expect(res.status).toBe(403);
    expect(prismaMock.comment.delete).not.toHaveBeenCalled();
  });

  test("本人であれば削除でき200を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(OWNER);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await DELETE(makeRequest(), makeContext("1"));

    expect(res.status).toBe(200);
    expect(prismaMock.comment.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  test("本人でなくても管理者であれば削除でき200を返す", async () => {
    getOrCreateCurrentUserMock.mockResolvedValue(ADMIN);
    prismaMock.comment.findUnique.mockResolvedValue({
      id: 1,
      userId: OWNER.id,
    });

    const res = await DELETE(makeRequest(), makeContext("1"));

    expect(res.status).toBe(200);
    expect(prismaMock.comment.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
