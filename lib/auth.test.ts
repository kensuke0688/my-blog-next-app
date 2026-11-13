import { describe, test, expect, vi, beforeEach } from "vitest";
import { requireAdmin } from "@/lib/auth";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/createClient", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

describe("requireAdmin", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    process.env.BLOG_ADMIN_USER_ID = "admin-id";
  });

  test("未ログインなら401を返す", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const res = await requireAdmin();

    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("Supabase側がエラーを返した場合も401を返す", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });

    const res = await requireAdmin();

    expect(res?.status).toBe(401);
  });

  test("ログイン済みでも管理者本人でなければ403を返す", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "someone-else" } },
      error: null,
    });

    const res = await requireAdmin();

    expect(res?.status).toBe(403);
  });

  test("管理者本人ならnullを返す(通過)", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "admin-id" } },
      error: null,
    });

    const res = await requireAdmin();

    expect(res).toBeNull();
  });
});
