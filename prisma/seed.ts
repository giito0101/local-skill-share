import { prisma } from "../lib/prisma";

async function main() {
  // いったん既存データを削除（開発用）
  await prisma.review.deleteMany();
  await prisma.skill.deleteMany();

  const now = new Date();
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 検索・新着の動作確認用に、カテゴリ・エリア・日付をバラす
  await prisma.skill.create({
    data: {
      title: "初心者向け英会話レッスン",
      description: "カフェでゆるく英会話を練習します。",
      price: 2000,
      category: "語学",
      area: "新宿",
      createdAt: daysAgo(3),
      reviews: {
        create: [
          { rating: 5, comment: "とても楽しく学べました！" },
          { rating: 4, comment: "丁寧で初心者にも分かりやすかったです。" },
        ],
      },
    },
  });

  await prisma.skill.create({
    data: {
      title: "浦安エリアの犬のしつけ相談",
      description: "吠え癖やお散歩の悩みを一緒に解決します。",
      price: 3000,
      category: "ペット",
      area: "浦安",
      createdAt: daysAgo(1),
      reviews: {
        create: [{ rating: 5, comment: "具体的なアドバイスがもらえました。" }],
      },
    },
  });

  await prisma.skill.create({
    data: {
      title: "PC 初期設定お手伝い",
      description: "Wi-Fi 設定・プリンタ接続などを代行します。",
      price: 1500,
      category: "PC・IT",
      area: "世田谷",
      createdAt: daysAgo(7),
      reviews: {
        create: [
          { rating: 4, comment: "すぐに作業してもらえて助かりました。" },
        ],
      },
    },
  });

  await prisma.skill.create({
    data: {
      title: "写真撮影（プロフィール・SNS 用）",
      description: "自然な雰囲気でプロフィール写真を撮ります。",
      price: 5000,
      category: "写真",
      area: "渋谷",
      createdAt: daysAgo(0), // 今日 → 新着テスト用
      reviews: {
        create: [
          { rating: 5, comment: "仕上がりが想像以上で満足です。" },
          { rating: 5, comment: "気楽に話しながら撮影できました。" },
        ],
      },
    },
  });

  await prisma.skill.create({
    data: {
      title: "在宅ワーク向けストレッチレッスン",
      description: "肩こり・腰痛対策の簡単なストレッチを教えます。",
      price: 2500,
      category: "健康",
      area: "池袋",
      createdAt: daysAgo(5),
      reviews: {
        create: [{ rating: 4, comment: "仕事前にやるとかなり楽になります。" }],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
