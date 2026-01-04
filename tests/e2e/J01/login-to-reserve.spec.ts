import { test, expect, Page } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
async function login(
  page: Page,
  { id, password }: { id: string; password: string }
) {
  await page.goto(`${baseUrl}/`);
  await page.getByRole("link", { name: "ログイン" }).click();

  await page.getByLabel("ID").fill(id);
  await page.getByLabel("パスワード").fill(password);
  await page.getByRole("button", { name: /ログイン/ }).click();

  const user = page.getByTestId("login-user");
  await expect(user).toBeVisible();
  await expect(user).toHaveText(id);
}

function toDisplayJa(iso: string) {
  // "2026-01-05T10:00" -> "2026/01/05 10:00"
  return iso.replace("T", " ").replaceAll("-", "/");
}

test.describe("J-01: login -> reserve", () => {
  test("login and make reservation", async ({ page }) => {
    // 予約時に使う入力（あとで提供者側で照合するため変数化）
    const reserveAt = "2026-01-05T10:00";
    const message = "E2Eテストです";

    // S01: learner login
    await test.step("S01: スキル要求者としてログインする", async () => {
      await login(page, { id: "test1", password: "test1-2025" });
    });

    // S02: スキル詳細へ（例：どれか1件開く）
    await test.step("S02: スキル詳細を開く", async () => {
      await page.goto(`${baseUrl}/`);
      await page
        .getByRole("link", { name: /スキル2（DOG_TRAINING）/ })
        .first()
        .click();
      await expect(
        page.getByRole("heading", { name: /スキル2（DOG_TRAINING）/ })
      ).toBeVisible();
    });

    // S03: 予約フォームへ
    await test.step("S03: 予約フォームへ進む", async () => {
      await page.getByRole("button", { name: /このスキルを予約する/ }).click();
      await expect(page.getByRole("heading", { name: /予約/ })).toBeVisible();
    });

    // S04: 予約送信 → 完了確認
    await test.step("S04: 予約送信して完了を確認", async () => {
      await page.getByLabel("希望日時").fill(reserveAt);
      await page.getByLabel(/メッセージ/).fill(message);
      await page.getByRole("button", { name: /送信|予約/ }).click();

      await expect(
        page.getByText("予約リクエストを送信しました。ありがとうございました。")
      ).toBeVisible();
    });

    // S05: provider 側で「未確定が追加された」ことを確認
    await test.step("S05: 提供者として予約一覧を開き、未確定が追加されたことを確認", async () => {
      // ✅ ログアウト導線があるならそれを使う（無ければ /logout ページに飛ばす等）
      // 例: リンク名が「ログアウト」なら:
      await page.getByRole("link", { name: /ログアウト/ }).click();
      await expect(page.getByRole("link", { name: /ログイン/ })).toBeVisible();

      // ✅ 提供者でログイン（ここはSeedの提供者アカウントに合わせて変更）
      await login(page, { id: "test2", password: "test2-2025" });

      // ✅ 提供者の予約一覧へ
      await page.goto(`${baseUrl}/reservations/my`);
      await expect(page.getByRole("link", { name: /予約一覧/ })).toBeVisible();

      // ✅ 一覧に「未確定」があり、かつ今回の予約っぽい情報が含まれること
      // ここはアプリの表示仕様に合わせて、最小1点に絞ってOK。
      // reserveAt は UI に表示される形式に合わせておく（例: "2026/01/05 10:00" など）
      const reserveAtText = toDisplayJa(reserveAt);

      const row = page
        .getByRole("row")
        .filter({ hasText: reserveAtText })
        .first();

      await expect(row).toBeVisible();

      // ✅ その行の中にあることを確認
      await expect(row.getByText("スキル2（DOG_TRAINING）")).toBeVisible();
      await expect(row.getByText("未確定")).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: "test-results/debug-login-to-reserve.png",
        fullPage: true,
      });
      console.log("URL after login:", page.url());
    });
  });
});
