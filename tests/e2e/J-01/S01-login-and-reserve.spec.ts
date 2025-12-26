import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// あなたが言ってたテストユーザー
const USER = { id: "test1", pw: "test1-2025" };

test.describe("E2E: login -> reserve", () => {
  test("login and make reservation", async ({ page }) => {
    // 1) トップへ
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });

    // 2) ログインへ（ヘッダー等の「ログイン」ボタン）
    //   - a/ button どちらでも拾えるようにしている
    await page
      .getByRole("link", { name: "ログイン" })
      .click()
      .catch(async () => {
        await page.getByRole("button", { name: "ログイン" }).click();
      });

    // 3) ログインフォーム入力
    //   - data-testid を推奨（後述）
    await page.getByTestId("loginId").fill(USER.id);
    await page.getByTestId("password").fill(USER.pw);

    // 4) 送信
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByTestId("loginSubmit").click(),
    ]);

    // 5) ログイン確認（ヘッダー等に test1 が出る想定）
    await expect(page.getByTestId("currentUser")).toHaveText(USER.id);

    // 6) 予約するスキルへ移動
    //   - 一番安定するのは「テスト用スキルカード」に data-testid を付けること
    //   - 例: data-testid="skillCard-s1"
    await page.getByTestId("skillCard-s02").click();

    // 7) 詳細ページで予約ボタン
    await page.getByTestId("reserveButton").click();

    // 8) 予約ページに来たこと
    await expect(page).toHaveURL(/\/skills\/.+\/reserve/);

    // 9) 希望日時を入力（datetime-local）
    // 例: 2025-12-31T09:00 形式
    const dt = "2025-12-31T09:00";

    await page.getByTestId("reserveDate").fill(dt);

    // 任意メッセージ
    await page.getByTestId("reserveMessage").fill("E2Eテスト予約です");

    // 10) 送信（予約作成）
    // 予約後に redirect がある想定（/skills/[id] に戻る等）
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      page.getByTestId("reserveSubmit").click(),
    ]);

    // 11) 成功の見た目（どれか1つでOK）
    // 例: トースト、メッセージ、予約一覧へのリンク表示など
    await expect(
      page.getByText("予約リクエストを送信しました。ありがとうございました。")
    ).toBeVisible();
  });
});
