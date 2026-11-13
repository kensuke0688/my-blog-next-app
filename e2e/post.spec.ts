import { test, expect } from "@playwright/test";
import path from "node:path";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const EXISTING_USER_ID = "1";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD が設定されていません。.env(ローカル)またはGitHub Secrets(CI)に設定してください。"
  );
}

test("管理者がログインして記事を投稿できる", async ({ page }) => {
  // 1. ログイン
  await page.goto("/sign_in");
  await page.getByLabel("メールアドレス").fill(ADMIN_EMAIL);
  await page.getByLabel("パスワード").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL("/admin/posts");

  // 2. 記事の新規作成画面へ
  await page.getByRole("link", { name: "新規作成" }).click();
  await expect(page).toHaveURL("/admin/posts/new");

  // 3. フォームに入力
  const title = `E2Eテスト記事 ${Date.now()}`;
  await page.getByLabel("タイトル").fill(title);
  await page.getByLabel("本文").fill("E2Eテストで投稿した本文です。");
  await page.getByLabel("ユーザーID(投稿者)").fill(EXISTING_USER_ID);

  // サムネイル画像をアップロードし、プレビューが表示される(=アップロード完了)まで待つ
  await page
    .getByLabel("サムネイル画像")
    .setInputFiles(path.join(__dirname, "fixtures", "thumbnail.png"));
  await expect(page.getByAltText("サムネイルプレビュー")).toBeVisible();

  // 4. 送信
  await page.getByRole("button", { name: "作成する" }).click();

  // 5. 作成した記事の編集画面に遷移し、入力した内容が保存されていることを確認
  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await expect(page.getByLabel("タイトル")).toHaveValue(title);

  // 6. 記事一覧にも反映されていることを確認
  await page.goto("/admin/posts");
  await expect(page.getByRole("link", { name: title })).toBeVisible();
});
