import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { SkillCategory, ReservationStatus } from "@/app/generated/prisma/enums";

function dt(s: string) {
  // dump.xlsx はタイムゾーン無しなので、ここではそのまま Date にする
  // もしズレが気になるなら "Z" を付ける等調整してOK
  return new Date(s.replace(" ", "T"));
}

async function main() {
  // 依存の弱い順に全削除（開発用）
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  // ===========================
  // Users（id:test1/test2/test3 を固定）
  // PASS はそれぞれ id と同じ（bcryptでhash）
  // ===========================
  const userRows = [
    {
      id: "test1",
      name: "Alice",
      email: "alice@example.com",
      pass: "test1-2025",
    },

    {
      id: "test2",
      name: "Bob",
      email: "bob@example.com",
      pass: "test2-2025",
    },

    {
      id: "test3",
      name: "Carol",
      email: "carol@example.com",
      pass: "test3-2025",
    },
  ] as const;

  const users = new Map<string, { id: string }>();
  for (const u of userRows) {
    const passwordHash = await bcrypt.hash(u.pass, 10);
    const created = await prisma.user.create({
      data: {
        id: u.id, // ← 固定
        name: u.name,
        email: u.email,
        passwordHash, // ← bcrypt
        image: null,
      },
      select: { id: true },
    });
    users.set(u.id, created);
  }

  const test1 = users.get("test1")!;
  const test2 = users.get("test2")!;
  const test3 = users.get("test3")!;

  // ===========================
  // Skills（dump.xlsx の id / ownerId / title / description / price を再現）
  // 追加で category/area/createdAt も “自然に” 入れる（あなたの元seed準拠）
  // ===========================
  const skill1 = await prisma.skill.create({
    data: {
      id: 1,
      ownerId: test1.id,
      title: "初心者向け英会話レッスン",
      description: "カフェでゆるく英会話を練習します。",
      price: 2000,
      category: SkillCategory.ENGLISH,
      area: "新宿",
      createdAt: dt("2025-12-08 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test2.id,
            rating: 5,
            comment: "とても楽しく学べました！",
            createdAt: dt("2025-12-11 07:17:35.891"),
          },
          {
            ownerId: test3.id,
            rating: 4,
            comment: "丁寧で初心者にも分かりやすかったです。",
            createdAt: dt("2025-12-11 07:17:35.891"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill2 = await prisma.skill.create({
    data: {
      id: 2,
      ownerId: test2.id,
      title: "浦安エリアの犬のしつけ相談",
      description: "吠え癖やお散歩の悩みを一緒に解決します。",
      price: 3000,
      category: SkillCategory.DOG_TRAINING,
      area: "浦安",
      createdAt: dt("2025-12-10 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test1.id,
            rating: 5,
            comment: "具体的なアドバイスがもらえました。",
            createdAt: dt("2025-12-11 07:17:36.914"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill3 = await prisma.skill.create({
    data: {
      id: 3,
      ownerId: test3.id,
      title: "PC 初期設定お手伝い",
      description: "Wi-Fi 設定・プリンタ接続などを代行します。",
      price: 1500,
      category: SkillCategory.PC_SUPPORT,
      area: "世田谷",
      createdAt: dt("2025-12-04 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test1.id,
            rating: 4,
            comment: "すぐに作業してもらえて助かりました。",
            createdAt: dt("2025-12-11 07:17:37.797"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill4 = await prisma.skill.create({
    data: {
      id: 4,
      ownerId: test1.id,
      title: "写真撮影（プロフィール・SNS 用）",
      description: "自然な雰囲気でプロフィール写真を撮ります。",
      price: 5000,
      category: SkillCategory.PHOTO,
      area: "渋谷",
      createdAt: dt("2025-12-11 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test2.id,
            rating: 5,
            comment: "仕上がりが想像以上で満足です。",
            createdAt: dt("2025-12-11 07:17:38.790"),
          },
          {
            ownerId: test3.id,
            rating: 5,
            comment: "気楽に話しながら撮影できました。",
            createdAt: dt("2025-12-11 07:17:38.790"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill5 = await prisma.skill.create({
    data: {
      id: 5,
      ownerId: test2.id,
      title: "在宅ワーク向けストレッチレッスン",
      description: "肩こり・腰痛対策の簡単なストレッチを教えます。",
      price: 2500,
      category: SkillCategory.OTHER,
      area: "池袋",
      createdAt: dt("2025-12-06 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test1.id,
            rating: 4,
            comment: "仕事前にやるとかなり楽になります。",
            createdAt: dt("2025-12-11 07:17:40.031"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill6 = await prisma.skill.create({
    data: {
      id: 6,
      ownerId: test3.id,
      title: "JavaScript/TypeScript コードレビュー",
      description: "初学者向けにコードの改善ポイントをフィードバックします。",
      price: 4000,
      category: SkillCategory.OTHER,
      area: "オンライン",
      createdAt: dt("2025-12-09 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test2.id,
            rating: 5,
            comment: "レビューが具体的で、学びが多かったです。",
            createdAt: dt("2025-12-11 07:17:40.930"),
          },
        ],
      },
    },
    select: { id: true },
  });

  const skill7 = await prisma.skill.create({
    data: {
      id: 7,
      ownerId: test1.id,
      title: "家庭料理 基本レッスン",
      description: "一人暮らし向けの簡単な定番メニューを一緒に作ります。",
      price: 3000,
      category: SkillCategory.OTHER,
      area: "中野",
      createdAt: dt("2025-12-07 07:17:35.308"),
      reviews: {
        create: [
          {
            ownerId: test3.id,
            rating: 5,
            comment: "包丁の持ち方から教えてもらえて安心でした。",
            createdAt: dt("2025-12-11 07:17:41.934"),
          },
        ],
      },
    },
    select: { id: true },
  });

  await prisma.skill.create({
    data: {
      id: 8,
      ownerId: test2.id,
      title: "ポートフォリオ相談・キャリア雑談",
      description:
        "駆け出しエンジニア向けにキャリア・ポートフォリオ相談にのります。",
      price: 0,
      category: SkillCategory.OTHER,
      area: "オンライン",
      createdAt: dt("2025-12-05 07:17:35.308"),
      // dump.xlsx には Review 9件で、skill8 にレビューは無い想定（元seedも無し）
    },
  });

  // ===========================
  // Reservations（dump.xlsx の内容を再現）
  // ===========================
  const reservationCreatedAt = dt("2025-12-11 07:17:35.308");
  const reservationUpdatedAt = dt("2025-12-11 07:17:43.852");

  await prisma.reservation.createMany({
    data: [
      {
        id: "r1",
        ownerId: test1.id,
        skillId: 2,
        date: dt("2025-12-12 07:17:35.308"),
        status: ReservationStatus.PENDING,
        message: "吠え癖について相談したいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
      {
        id: "r2",
        ownerId: test1.id,
        skillId: 1,
        date: dt("2025-12-09 07:17:35.308"),
        status: ReservationStatus.CONFIRMED,
        message: "発音中心でお願いしたいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
      {
        id: "r3",
        ownerId: test2.id,
        skillId: 4,
        date: dt("2025-12-11 07:17:35.308"),
        status: ReservationStatus.CONFIRMED,
        message: "転職用のプロフィール写真を撮りたいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
      {
        id: "r4",
        ownerId: test2.id,
        skillId: 5,
        date: dt("2025-12-08 07:17:35.308"),
        status: ReservationStatus.PENDING,
        message: "在宅ワーク中の肩こり対策が知りたいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
      {
        id: "r5",
        ownerId: test3.id,
        skillId: 3,
        date: dt("2025-12-13 07:17:35.308"),
        status: ReservationStatus.PENDING,
        message: "ノートPCの初期設定を一緒にお願いしたいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
      {
        id: "r6",
        ownerId: test3.id,
        skillId: 6,
        date: dt("2025-12-06 07:17:35.308"),
        status: ReservationStatus.CANCELED,
        message: "ポートフォリオ用コードのレビューをお願いしたいです。",
        createdAt: reservationCreatedAt,
        updatedAt: reservationUpdatedAt,
      },
    ],
  });

  // ===========================
  // Conversations（dump.xlsx を再現）
  // ※ self requester/provider も “dump通り” 作る（ガードしない）
  // ===========================
  const convRows = [
    {
      id: "conversation1",
      reservationId: "r1",
      requesterId: "test1",
      providerId: "test2",
      createdAt: "2025-12-11 07:17:35.308",
      updatedAt: "2025-12-11 07:17:45.110",
    },
    {
      id: "conversation2",
      reservationId: "r3",
      requesterId: "test2",
      providerId: "test1",
      createdAt: "2025-12-11 07:17:35.308",
      updatedAt: "2025-12-11 07:17:46.047",
    },
    {
      id: "conversation3",
      reservationId: "r2",
      requesterId: "test1",
      providerId: "test1",
      createdAt: "2025-12-11 08:12:19.619",
      updatedAt: "2025-12-11 08:12:19.619",
    },
    {
      id: "conversation4",
      reservationId: "r4",
      requesterId: "test2",
      providerId: "test2",
      createdAt: "2025-12-11 07:17:35.308",
      updatedAt: "2025-12-11 07:17:35.308",
    },
    {
      id: "conversation5",
      reservationId: "r5",
      requesterId: "test3",
      providerId: "test3",
      createdAt: "2025-12-11 07:17:35.308",
      updatedAt: "2025-12-11 07:17:35.308",
    },
    {
      id: "conversation6",
      reservationId: "r6",
      requesterId: "test3",
      providerId: "test3",
      createdAt: "2025-12-11 07:17:35.308",
      updatedAt: "2025-12-11 07:17:35.308",
    },
  ] as const;

  for (const c of convRows) {
    // updatedAt が @updatedAt なら上書きされる可能性があるけど、
    // “辻褄”には影響しないのでそのまま入れておく
    await prisma.conversation.create({
      data: {
        id: c.id,
        reservationId: c.reservationId,
        requesterId: c.requesterId,
        providerId: c.providerId,
        createdAt: dt(c.createdAt),
        updatedAt: dt(c.updatedAt),
      },
    });
  }

  // ===========================
  // Messages（dump.xlsx を再現）
  // ===========================
  await prisma.message.createMany({
    data: [
      {
        id: "message1",
        conversationId: "conversation1",
        senderId: "test1",
        body: "はじめまして、予約させていただきました。",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message2",
        conversationId: "conversation1",
        senderId: "test2",
        body: "ご予約ありがとうございます。当日はよろしくお願いします！",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message3",
        conversationId: "conversation2",
        senderId: "test2",
        body: "はじめまして、予約させていただきました。",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message4",
        conversationId: "conversation2",
        senderId: "test1",
        body: "ご予約ありがとうございます。当日はよろしくお願いします！",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message5",
        conversationId: "conversation1",
        senderId: "test1",
        body: "test",
        createdAt: dt("2025-12-11 07:22:38.875"),
      },
      {
        id: "message6",
        conversationId: "conversation4",
        senderId: "test2",
        body: "在宅ワーク中の肩こり対策が知りたいです。",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message7",
        conversationId: "conversation5",
        senderId: "test3",
        body: "ノートPCの初期設定を一緒にお願いしたいです。",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
      {
        id: "message8",
        conversationId: "conversation6",
        senderId: "test3",
        body: "ポートフォリオ用コードのレビューをお願いしたいです。",
        createdAt: dt("2025-12-11 07:17:35.308"),
      },
    ],
  });

  console.log("Seed done ✅  login: ID=test1 / PASS=test1");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
