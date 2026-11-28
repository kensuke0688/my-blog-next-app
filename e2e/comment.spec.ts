import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD が設定されていません。.env(ローカル)またはGitHub Secrets(CI)に設定してください。",
  );
}

test("記事詳細ページでコメントの投稿・編集・削除ができる", async ({ page }) => {
  await page.goto("/sign_in");
  await page.getByLabel("メールアドレス").fill(ADMIN_EMAIL);
  await page.getByLabel("パスワード").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL("/admin/posts");

  const postsRes = await page.request.get("/api/posts");
  const { posts } = await postsRes.json();
  const postId = posts[0].id;

  await page.goto(`/article/${postId}`);

  const content = `E2Eテストコメント ${Date.now()}`;
  await page.getByPlaceholder("コメントを入力").fill(content);
  await page.getByRole("button", { name: "コメントする" }).click();

  const commentItem = page.locator("li").filter({ hasText: content });
  await expect(commentItem).toBeVisible();

  await commentItem.getByRole("button", { name: "編集" }).click();
  const updatedContent = `${content}(編集済み)`;
  await commentItem.locator("textarea").fill(updatedContent);
  await commentItem.getByRole("button", { name: "保存" }).click();
  await expect(
    page.locator("li").filter({ hasText: updatedContent }),
  ).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("li")
    .filter({ hasText: updatedContent })
    .getByRole("button", { name: "削除" })
    .click();
  await expect(
    page.locator("li").filter({ hasText: updatedContent }),
  ).toHaveCount(0);
});
