import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

async function login(page: Page, loginId: string, password: string) {
  await page.goto(`${BASE_URL}/`);
  await page.getByRole("link", { name: "ログイン" }).click();

  await page.getByLabel("ID").fill(loginId);
  await page.getByLabel(/パスワード|Password/i).fill(password);

  await page.getByRole("button", { name: /ログイン|Sign in/i }).click();

  const user = page.getByTestId("login-user");
  await expect(user).toBeVisible();
  await expect(user).toHaveText(loginId);
}

async function logout(page: Page) {
  await Promise.all([
    page
      .waitForURL("**/logout", { waitUntil: "domcontentloaded" })
      .catch(() => {}),
    page.getByRole("link", { name: /ログアウト/ }).click(),
  ]);

  await expect(page.getByRole("link", { name: /ログイン/ })).toBeVisible();
}

function toDisplayJa(iso: string) {
  return iso.replace("T", " ").replaceAll("-", "/");
}

function reservationRow(
  page: Page,
  opts: { skillName: string; reserveAtText: string; statusText: string }
) {
  return page
    .getByRole("row")
    .filter({ hasText: opts.skillName })
    .filter({ hasText: opts.reserveAtText })
    .filter({ hasText: opts.statusText })
    .first();
}

test.describe("J02: 予約が承認される", () => {
  test("requester(test1)が予約作成 → provider(test2)が承認 → requesterが承認済み確認", async ({
    page,
  }) => {
    const reserveAt = "2026-01-06T10:00";
    const reserveAtText = toDisplayJa(reserveAt);
    const skillName = "スキル2（DOG_TRAINING）";

    let reservationUrl: string | null = null;
    let reservationId: string | null = null;

    // -----------------------------
    // S01: requester(test1) ログイン
    // -----------------------------
    await test.step("S01: requester(test1) ログイン", async () => {
      await login(page, "test1", "test1-2025");
    });

    // -----------------------------
    // S02: スキル詳細へ移動
    // -----------------------------
    await test.step("S02: トップ → スキル詳細へ移動", async () => {
      await page.goto(`${BASE_URL}/`);
      await page
        .getByRole("link", { name: new RegExp(skillName) })
        .first()
        .click();
      await expect(
        page.getByRole("button", { name: /このスキルを予約する/ })
      ).toBeVisible();
    });

    // -----------------------------
    // S03: 予約フォーム入力 → 送信 → 完了表示
    // -----------------------------
    await test.step("S03: 予約フォーム入力 → 送信 → 完了表示", async () => {
      await page.getByRole("button", { name: /このスキルを予約する/ }).click();

      await page.getByLabel("希望日時").fill(reserveAt);
      await page.getByLabel(/メッセージ/).fill("J02のE2Eテストです");

      await page.getByRole("button", { name: /送信|予約/ }).click();

      await expect(
        page.getByText("予約リクエストを送信しました。ありがとうございました。")
      ).toBeVisible();
    });

    // -----------------------------
    // S04: logout → provider(test2) ログイン
    // -----------------------------
    await test.step("S04: logout → provider(test2) ログイン", async () => {
      await logout(page);
      await login(page, "test2", "test2-2025");
    });

    // -----------------------------
    // S05: provider 予約一覧で「未確定」の行を特定
    // -----------------------------
    await test.step("S05: provider 予約一覧で『未確定』の行を特定", async () => {
      await page.goto(`${BASE_URL}/reservations/my`);

      const row = reservationRow(page, {
        skillName,
        reserveAtText,
        statusText: "未確定",
      });

      await expect(row).toBeVisible();
      await expect(row.getByText(skillName)).toBeVisible();
      await expect(row.getByText("未確定")).toBeVisible();
    });

    // -----------------------------
    // S06: 詳細へ → reservationId取得
    // -----------------------------
    await test.step("S06: 詳細へ → reservationId取得", async () => {
      const row = reservationRow(page, {
        skillName,
        reserveAtText,
        statusText: "未確定",
      });

      await row.getByRole("link", { name: /詳細/ }).click();

      reservationUrl = page.url();
      reservationId =
        reservationUrl.split("/reservations/")[1]?.split("?")[0] ?? null;

      // 予約詳細に来た前提の最低限チェック（見出し等があるならそれに置き換えてOK）
      await expect(page).toHaveURL(/\/reservations\//);
    });

    // -----------------------------
    // S07: (任意) チャット送信 → 予約詳細へ戻る
    // -----------------------------
    await test.step("S07: (任意) チャット送信 → 予約詳細へ戻る", async () => {
      const chatLink = page.getByRole("link", { name: /チャット/i });

      if ((await chatLink.count()) === 0) return;

      await chatLink.click();

      const input = page.getByRole("textbox").first();
      await input.fill("承認します。よろしくお願いします！");
      await page.getByRole("button", { name: /送信|Send/i }).click();

      await expect(
        page.getByText("承認します。よろしくお願いします！")
      ).toBeVisible();

      if (reservationUrl) {
        await page.goto(reservationUrl);
      }
    });

    // -----------------------------
    // S08: 承認ボタン → 承認完了（一覧で確定を再確認）
    // -----------------------------
    await test.step("S08: 承認ボタン → 一覧で『確定』を再確認", async () => {
      await page.getByRole("button", { name: "承認" }).click();

      // 画面側に「承認しました」等が出るならここで検証してOK
      // await expect(page.getByText(/承認|確定|更新しました|完了/i)).toBeVisible();

      // 一覧へ戻って “確定” を確認（rowは作り直す）
      await page.goto(`${BASE_URL}/reservations/my`);

      const confirmedRow = reservationRow(page, {
        skillName,
        reserveAtText,
        statusText: "確定",
      });

      await expect(confirmedRow).toBeVisible();
      await expect(confirmedRow.getByText(skillName)).toBeVisible();
      await expect(confirmedRow.getByText("確定")).toBeVisible();

      // reservationId が取れてるならリンク存在も確認（任意）
      if (reservationId) {
        await expect(
          page.locator(`a[href="/reservations/${reservationId}"]`)
        ).toBeVisible();
      }
    });

    // -----------------------------
    // S09: logout → requester(test1) ログイン
    // -----------------------------
    await test.step("S09: logout → requester(test1) ログイン", async () => {
      await logout(page);
      await login(page, "test1", "test1-2025");
    });

    // -----------------------------
    // S10: requester 側で「承認済み」を確認（マイページ等）
    // -----------------------------
    await test.step("S10: requester 側で『承認済み』を確認", async () => {
      await page.goto(`${BASE_URL}/mypage`);

      const item = page
        .getByTestId("reservation-item")
        .filter({ hasText: skillName })
        .filter({ hasText: reserveAtText })
        .filter({ hasText: "提供者: test2" })
        .filter({ hasText: "状態: 承認済み" })
        .first();

      await expect(item).toHaveCount(1);
      await expect(item.first()).toBeVisible();
    });
  });
});
