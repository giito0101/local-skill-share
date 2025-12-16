import { prisma } from "../lib/prisma";
import { SkillCategory, ReservationStatus } from "@/app/generated/prisma/enums";

const now = new Date();
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

async function main() {
  // 依存関係の弱い順に削除
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.skill.deleteMany();

  // ----------------------------
  // Users (10)
  // loginId = test1..test10 / password = test1..test10（bcrypt）
  // ----------------------------
  const users = await Promise.all(
    Array.from({ length: 10 }, async (_, idx) => {
      const n = idx + 1;
      const id = `test${n}`;
      // const passwordHash = await bcrypt.hash(`${id}-2025`, 10);

      return prisma.user.create({
        data: {
          id, // ✅ ここがログインID
          name: id, // ✅ authorizeが name を見るなら name も同じにしておく
          email: `${id}@example.com`,
          passwordHash,
          image: null,
          bio: `seed user ${id}`,
        },
      });
    })
  );

  const userIds = users.map((u) => u.id);

  // ----------------------------
  // Skills (20)
  // ----------------------------
  const categories: SkillCategory[] = [
    SkillCategory.ENGLISH,
    SkillCategory.DOG_TRAINING,
    SkillCategory.PC_SUPPORT,
    SkillCategory.PHOTO,
    SkillCategory.OTHER,
  ];

  const areas = [
    "新宿",
    "渋谷",
    "池袋",
    "世田谷",
    "中野",
    "浦安",
    "オンライン",
    "秋葉原",
    "吉祥寺",
    "品川",
  ];

  const skillSeeds = Array.from({ length: 20 }, (_, i) => {
    const ownerId = pick(userIds, i);
    const category = pick(categories, i);
    const area = pick(areas, i);
    return {
      ownerId,
      title: `スキル${i + 1}（${category}）`,
      description: `スキル${i + 1}の説明です。エリア:${area}`,
      price: (i % 6) * 1000 + 1000, // 1000〜6000
      category,
      area,
      createdAt: daysFromNow(-i), // 新着っぽく
      updatedAt: daysFromNow(-i),
      imageUrl: null,
    };
  });

  const skills = await Promise.all(
    skillSeeds.map((s) => prisma.skill.create({ data: s }))
  );
  const skillIds = skills.map((s) => s.id);

  // ----------------------------
  // Reviews (20)
  // 「レビューした人(ownerId)」は skill.ownerId と被らないようにする
  // ----------------------------
  await Promise.all(
    Array.from({ length: 20 }, async (_, i) => {
      const skill = skills[i % skills.length];
      const reviewerId = userIds.find((uid) => uid !== skill.ownerId)!;

      return prisma.review.create({
        data: {
          skillId: skill.id,
          ownerId: reviewerId,
          rating: (i % 5) + 1,
          comment: `レビュー${i + 1}: スキル${skill.id}に対するコメント`,
          createdAt: daysFromNow(-i),
        },
      });
    })
  );

  // ----------------------------
  // Reservations (20)
  // ownerId = 予約した人（依頼側） / skillId = 予約対象スキル
  // 予約者は skill.ownerId と被らないようにする
  // ----------------------------
  const reservationRows = Array.from({ length: 20 }, (_, i) => {
    const skill = skills[i % skills.length];
    const requesterId = userIds.find((uid) => uid !== skill.ownerId)!;

    const statusPool: ReservationStatus[] = [
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.CANCELED,
    ];

    // 適当に「未来/過去」を混ぜる
    const date = i % 2 === 0 ? daysFromNow(i + 1) : daysFromNow(-(i + 1));

    return {
      id: `r${String(i + 1).padStart(2, "0")}`,
      ownerId: requesterId,
      skillId: skill.id,
      date,
      message: `予約${i + 1}: スキル${skill.id}を予約したいです`,
      status: pick(statusPool, i),
      createdAt: daysFromNow(-i),
      updatedAt: daysFromNow(-i),
    };
  });

  await prisma.reservation.createMany({ data: reservationRows });

  // ----------------------------
  // Conversations (10) + Messages (20)
  // 「会話10件」= 予約の先頭10件に会話を作る
  // 「メッセージ20件」= 各会話に2件ずつ
  // ----------------------------
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { skill: { select: { ownerId: true } } },
  });

  for (let i = 0; i < reservations.length; i++) {
    const r = reservations[i];
    const requesterId = r.ownerId; // 依頼側
    const providerId = r.skill.ownerId; // 提供側

    // 念のため自分のスキル予約を避ける
    if (requesterId === providerId) continue;

    await prisma.conversation.create({
      data: {
        reservationId: r.id,
        requesterId,
        providerId,
        createdAt: r.createdAt,
        messages: {
          create: [
            {
              senderId: requesterId,
              body: r.message ?? "予約しました！よろしくお願いします。",
              createdAt: r.createdAt,
            },
            {
              senderId: providerId,
              body: "ご予約ありがとうございます。日程など確認しましょう！",
              createdAt: r.createdAt,
            },
          ],
        },
      },
    });
  }

  console.log(
    "Seed done ✅ (users10 skills20 reviews20 reservations20 conversations10 messages20)"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
