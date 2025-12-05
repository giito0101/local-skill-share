// prisma/seed.ts
import { prisma } from "../lib/prisma";

async function main() {
  // 開発用なので一旦全部消す（依存関係の弱い順に）
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const now = new Date();
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // ===========================
  // User
  // ===========================
  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "dummy", // MVPなので適当でOK
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@example.com",
      passwordHash: "dummy",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol",
      email: "carol@example.com",
      passwordHash: "dummy",
    },
  });

  // ===========================
  // Skill + Review
  // ===========================
  const skill1 = await prisma.skill.create({
    data: {
      ownerId: alice.id,
      title: "初心者向け英会話レッスン",
      description: "カフェでゆるく英会話を練習します。",
      price: 2000,
      category: "語学",
      area: "新宿",
      createdAt: daysAgo(3),
      reviews: {
        create: [
          {
            ownerId: bob.id,
            rating: 5,
            comment: "とても楽しく学べました！",
          },
          {
            ownerId: carol.id,
            rating: 4,
            comment: "丁寧で初心者にも分かりやすかったです。",
          },
        ],
      },
    },
  });

  const skill2 = await prisma.skill.create({
    data: {
      ownerId: bob.id,
      title: "浦安エリアの犬のしつけ相談",
      description: "吠え癖やお散歩の悩みを一緒に解決します。",
      price: 3000,
      category: "ペット",
      area: "浦安",
      createdAt: daysAgo(1),
      reviews: {
        create: [
          {
            ownerId: alice.id,
            rating: 5,
            comment: "具体的なアドバイスがもらえました。",
          },
        ],
      },
    },
  });

  const skill3 = await prisma.skill.create({
    data: {
      ownerId: carol.id,
      title: "PC 初期設定お手伝い",
      description: "Wi-Fi 設定・プリンタ接続などを代行します。",
      price: 1500,
      category: "PC・IT",
      area: "世田谷",
      createdAt: daysAgo(7),
      reviews: {
        create: [
          {
            ownerId: alice.id,
            rating: 4,
            comment: "すぐに作業してもらえて助かりました。",
          },
        ],
      },
    },
  });

  const skill4 = await prisma.skill.create({
    data: {
      ownerId: alice.id,
      title: "写真撮影（プロフィール・SNS 用）",
      description: "自然な雰囲気でプロフィール写真を撮ります。",
      price: 5000,
      category: "写真",
      area: "渋谷",
      createdAt: daysAgo(0), // 今日
      reviews: {
        create: [
          {
            ownerId: bob.id,
            rating: 5,
            comment: "仕上がりが想像以上で満足です。",
          },
          {
            ownerId: carol.id,
            rating: 5,
            comment: "気楽に話しながら撮影できました。",
          },
        ],
      },
    },
  });

  const skill5 = await prisma.skill.create({
    data: {
      ownerId: bob.id,
      title: "在宅ワーク向けストレッチレッスン",
      description: "肩こり・腰痛対策の簡単なストレッチを教えます。",
      price: 2500,
      category: "健康",
      area: "池袋",
      createdAt: daysAgo(5),
      reviews: {
        create: [
          {
            ownerId: alice.id,
            rating: 4,
            comment: "仕事前にやるとかなり楽になります。",
          },
        ],
      },
    },
  });

  const skill6 = await prisma.skill.create({
    data: {
      ownerId: carol.id,
      title: "JavaScript/TypeScript コードレビュー",
      description: "初学者向けにコードの改善ポイントをフィードバックします。",
      price: 4000,
      category: "プログラミング",
      area: "オンライン",
      createdAt: daysAgo(2),
      reviews: {
        create: [
          {
            ownerId: bob.id,
            rating: 5,
            comment: "レビューが具体的で、学びが多かったです。",
          },
        ],
      },
    },
  });

  const skill7 = await prisma.skill.create({
    data: {
      ownerId: alice.id,
      title: "家庭料理 基本レッスン",
      description: "一人暮らし向けの簡単な定番メニューを一緒に作ります。",
      price: 3000,
      category: "料理",
      area: "中野",
      createdAt: daysAgo(4),
      reviews: {
        create: [
          {
            ownerId: carol.id,
            rating: 5,
            comment: "包丁の持ち方から教えてもらえて安心でした。",
          },
        ],
      },
    },
  });

  const skill8 = await prisma.skill.create({
    data: {
      ownerId: bob.id,
      title: "ポートフォリオ相談・キャリア雑談",
      description:
        "駆け出しエンジニア向けにキャリア・ポートフォリオ相談にのります。",
      price: 0,
      category: "キャリア",
      area: "オンライン",
      createdAt: daysAgo(6),
      reviews: {
        create: [
          {
            ownerId: alice.id,
            rating: 5,
            comment: "方向性が少し見えてきました。ありがとうございました。",
          },
        ],
      },
    },
  });

  // ===========================
  // Reservation サンプル
  // ===========================
  await prisma.reservation.createMany({
    data: [
      {
        id: "r1",
        ownerId: alice.id, // 予約した人
        skillId: skill2.id, // 浦安 犬
        date: daysAgo(-1), // 1日後
        message: "吠え癖について相談したいです。",
        status: "PENDING", // まだ受付中
        createdAt: now,
      },
      {
        id: "r2",
        ownerId: bob.id,
        skillId: skill1.id, // 英会話
        date: daysAgo(-2),
        message: "発音中心でお願いしたいです。",
        status: "CONFIRMED", // 承認済み
        createdAt: now,
      },
      {
        id: "r3",
        ownerId: carol.id,
        skillId: skill4.id, // 写真
        date: daysAgo(-3),
        message: "転職用のプロフィール写真を撮りたいです。",
        status: "CANCELED", // キャンセル済み
        createdAt: now,
      },
    ],
  });

  // ===========================
  // Conversation + Message サンプル
  // ===========================

  // Alice ↔ Bob の会話
  const convAliceBob = await prisma.conversation.create({
    data: {
      userAId: alice.id,
      userBId: bob.id,
      createdAt: daysAgo(1),
      messages: {
        create: [
          {
            senderId: alice.id,
            body: "こんにちは！英会話レッスンのことで相談させてください。",
            createdAt: daysAgo(1),
          },
          {
            senderId: bob.id,
            body: "こんにちは！もちろんです。どのあたりが不安ですか？",
            createdAt: daysAgo(1),
          },
          {
            senderId: alice.id,
            body: "発音と、実際に話すときに頭が真っ白になるのが心配です。",
            createdAt: daysAgo(1),
          },
        ],
      },
    },
  });

  // Alice ↔ Carol の会話
  const convAliceCarol = await prisma.conversation.create({
    data: {
      userAId: alice.id,
      userBId: carol.id,
      createdAt: daysAgo(2),
      messages: {
        create: [
          {
            senderId: carol.id,
            body: "この前の PC 初期設定ありがとうございました！",
            createdAt: daysAgo(2),
          },
          {
            senderId: alice.id,
            body: "こちらこそ、また何かあれば気軽に相談してください〜",
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  });

  // Bob ↔ Carol の会話（軽め）
  const convBobCarol = await prisma.conversation.create({
    data: {
      userAId: bob.id,
      userBId: carol.id,
      createdAt: daysAgo(3),
      messages: {
        create: [
          {
            senderId: bob.id,
            body: "ストレッチレッスン、平日夜にもやってますか？",
            createdAt: daysAgo(3),
          },
          {
            senderId: carol.id,
            body: "はい、20時以降なら調整できます！",
            createdAt: daysAgo(3),
          },
        ],
      },
    },
  });

  console.log("Seed done ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
