import { test, expect, type Locator, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD が設定されていません。.env(ローカル)またはGitHub Secrets(CI)に設定してください。",
  );
}

// いいねの切り替えは楽観的更新のため、見た目の変化だけでなく
// トグルAPIのレスポンスが返るまで待ってから次の操作に進む。
// 待たずにテストを終えると、ページが閉じられてリクエストが
// 中断され、サーバー側の状態が更新されないまま残ることがある。
async function clickLikeAndWaitForToggle(page: Page, likeButton: Locator) {
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/likes") && res.request().method() === "POST",
    ),
    likeButton.click(),
  ]);
}

test.describe("いいね機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign_in");
    await page.getByLabel("メールアドレス").fill(ADMIN_EMAIL);
    await page.getByLabel("パスワード").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL("/admin/posts");
  });

  test("記事詳細ページでいいねをON/OFFでき、リロード後も保持される", async ({
    page,
  }) => {
    const postsRes = await page.request.get("/api/posts");
    const { posts } = await postsRes.json();
    const postId = posts[0].id;

    await page.goto(`/article/${postId}`);
    const likeButton = page.getByRole("button", { name: /いいね/ });
    await expect(likeButton).toBeVisible();

    // 前回実行の後片付けが何らかの理由で失敗し、いいね済み状態が残っている
    // 可能性があるため、未いいね状態から始まるよう保証する。
    if ((await likeButton.getAttribute("aria-pressed")) === "true") {
      await clickLikeAndWaitForToggle(page, likeButton);
      await expect(likeButton).toHaveAttribute("aria-pressed", "false");
    }

    const initialCount = Number(await likeButton.locator("span").textContent());

    try {
      await clickLikeAndWaitForToggle(page, likeButton);
      await expect(likeButton.locator("span")).toHaveText(
        String(initialCount + 1),
      );

      await page.reload();
      await expect(
        page.getByRole("button", { name: /いいね/ }).locator("span"),
      ).toHaveText(String(initialCount + 1));
    } finally {
      // 後片付け: もう一度トグルしていいねを取り消し、元の件数に戻す
      await clickLikeAndWaitForToggle(
        page,
        page.getByRole("button", { name: /いいね/ }),
      );
    }
  });

  test("記事一覧にはいいね数のみ表示され、クリックできない", async ({
    page,
  }) => {
    const postsRes = await page.request.get("/api/posts");
    const { posts } = await postsRes.json();

    await page.goto("/");

    // 一覧ページにはいいねを押すボタンが存在しないこと(件数表示のみ)を確認する。
    await expect(page.getByRole("button", { name: /いいね/ })).toHaveCount(0);

    const firstCard = page.locator("li").filter({ hasText: posts[0].title });
    await expect(firstCard).toContainText(String(posts[0].likeCount));
  });
});
