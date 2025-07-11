import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 개발 모드인지 확인
const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true';

// 목업 사용자 데이터
const mockUsers = [
  {
    email: isDevelopmentMode && process.env.DEV_USER_EMAIL ? process.env.DEV_USER_EMAIL : 'demo@example.com',
    password: isDevelopmentMode && process.env.DEV_USER_PASSWORD ? process.env.DEV_USER_PASSWORD : 'demo123456',
    targetCalories: isDevelopmentMode && process.env.DEV_USER_TARGET_CALORIES ? parseInt(process.env.DEV_USER_TARGET_CALORIES) : 2000,
  },
  {
    email: isDevelopmentMode && process.env.DEV_ADMIN_EMAIL ? process.env.DEV_ADMIN_EMAIL : 'test@example.com',
    password: isDevelopmentMode && process.env.DEV_ADMIN_PASSWORD ? process.env.DEV_ADMIN_PASSWORD : 'test123456',
    targetCalories: isDevelopmentMode && process.env.DEV_ADMIN_TARGET_CALORIES ? parseInt(process.env.DEV_ADMIN_TARGET_CALORIES) : 1800,
  },
  {
    email: isDevelopmentMode && process.env.DEV_USER2_EMAIL ? process.env.DEV_USER2_EMAIL : 'user@example.com',
    password: isDevelopmentMode && process.env.DEV_USER2_PASSWORD ? process.env.DEV_USER2_PASSWORD : 'user123456',
    targetCalories: isDevelopmentMode && process.env.DEV_USER2_TARGET_CALORIES ? parseInt(process.env.DEV_USER2_TARGET_CALORIES) : 2200,
  },
];

// 목업 일기 데이터
const mockDiaries = [
  {
    content:
      '오늘 점심으로 맛있는 비빔밥을 먹었다. 야채가 신선하고 고추장이 적당히 매워서 정말 맛있었다.',
    totalCalories: 650,
    calorieBreakdown: {
      밥: {
        protein: { amount: 4, unit: 'g', calories: 16 },
        fat: { amount: 0.5, unit: 'g', calories: 4.5 },
        carbohydrate: { amount: 35, unit: 'g', calories: 140 },
      },
      소고기: {
        protein: { amount: 22, unit: 'g', calories: 88 },
        fat: { amount: 15, unit: 'g', calories: 135 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      계란: {
        protein: { amount: 6, unit: 'g', calories: 24 },
        fat: { amount: 5, unit: 'g', calories: 45 },
        carbohydrate: { amount: 0.6, unit: 'g', calories: 2.4 },
      },
      야채믹스: {
        protein: { amount: 3, unit: 'g', calories: 12 },
        fat: { amount: 0.3, unit: 'g', calories: 2.7 },
        carbohydrate: { amount: 8, unit: 'g', calories: 32 },
      },
      고추장: {
        protein: { amount: 2, unit: 'g', calories: 8 },
        fat: { amount: 1, unit: 'g', calories: 9 },
        carbohydrate: { amount: 12, unit: 'g', calories: 48 },
      },
    },
    daysAgo: 1,
  },
  {
    content:
      '아침에 간단하게 토스트와 계란후라이를 만들어 먹었다. 커피와 함께 든든한 아침 식사였다.',
    totalCalories: 420,
    calorieBreakdown: {
      식빵: {
        protein: { amount: 8, unit: 'g', calories: 32 },
        fat: { amount: 3, unit: 'g', calories: 27 },
        carbohydrate: { amount: 45, unit: 'g', calories: 180 },
      },
      계란: {
        protein: { amount: 12, unit: 'g', calories: 48 },
        fat: { amount: 10, unit: 'g', calories: 90 },
        carbohydrate: { amount: 1, unit: 'g', calories: 4 },
      },
      버터: {
        protein: { amount: 0.5, unit: 'g', calories: 2 },
        fat: { amount: 8, unit: 'g', calories: 72 },
        carbohydrate: { amount: 0.1, unit: 'g', calories: 0.4 },
      },
      잼: {
        protein: { amount: 0.2, unit: 'g', calories: 0.8 },
        fat: { amount: 0.1, unit: 'g', calories: 0.9 },
        carbohydrate: { amount: 13, unit: 'g', calories: 52 },
      },
    },
    daysAgo: 2,
  },
  {
    content:
      '저녁에 치킨 샐러드를 주문해서 먹었다. 단백질이 많아서 운동 후 식사로 좋았다.',
    totalCalories: 380,
    calorieBreakdown: {
      닭가슴살: {
        protein: { amount: 25, unit: 'g', calories: 100 },
        fat: { amount: 3, unit: 'g', calories: 27 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      양상추: {
        protein: { amount: 1, unit: 'g', calories: 4 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 3, unit: 'g', calories: 12 },
      },
      토마토: {
        protein: { amount: 1, unit: 'g', calories: 4 },
        fat: { amount: 0.3, unit: 'g', calories: 2.7 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      오이: {
        protein: { amount: 0.7, unit: 'g', calories: 2.8 },
        fat: { amount: 0.1, unit: 'g', calories: 0.9 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      드레싱: {
        protein: { amount: 0.5, unit: 'g', calories: 2 },
        fat: { amount: 15, unit: 'g', calories: 135 },
        carbohydrate: { amount: 5, unit: 'g', calories: 20 },
      },
    },
    daysAgo: 3,
  },
  {
    content:
      '점심에 김치찌개와 밥을 먹었다. 매콤하고 얼큰해서 몸이 따뜻해졌다.',
    totalCalories: 580,
    calorieBreakdown: {
      밥: {
        protein: { amount: 5, unit: 'g', calories: 20 },
        fat: { amount: 0.8, unit: 'g', calories: 7.2 },
        carbohydrate: { amount: 45, unit: 'g', calories: 180 },
      },
      김치: {
        protein: { amount: 2, unit: 'g', calories: 8 },
        fat: { amount: 0.5, unit: 'g', calories: 4.5 },
        carbohydrate: { amount: 6, unit: 'g', calories: 24 },
      },
      돼지고기: {
        protein: { amount: 20, unit: 'g', calories: 80 },
        fat: { amount: 25, unit: 'g', calories: 225 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      두부: {
        protein: { amount: 8, unit: 'g', calories: 32 },
        fat: { amount: 4, unit: 'g', calories: 36 },
        carbohydrate: { amount: 2, unit: 'g', calories: 8 },
      },
    },
    daysAgo: 4,
  },
  {
    content:
      '브런치로 팬케이크와 베리를 먹었다. 달콤하고 맛있었지만 칼로리가 높은 것 같다.',
    totalCalories: 520,
    calorieBreakdown: {
      팬케이크: {
        protein: { amount: 8, unit: 'g', calories: 32 },
        fat: { amount: 12, unit: 'g', calories: 108 },
        carbohydrate: { amount: 60, unit: 'g', calories: 240 },
      },
      메이플시럽: {
        protein: { amount: 0, unit: 'g', calories: 0 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 32, unit: 'g', calories: 128 },
      },
      블루베리: {
        protein: { amount: 0.7, unit: 'g', calories: 2.8 },
        fat: { amount: 0.3, unit: 'g', calories: 2.7 },
        carbohydrate: { amount: 14, unit: 'g', calories: 56 },
      },
      딸기: {
        protein: { amount: 0.7, unit: 'g', calories: 2.8 },
        fat: { amount: 0.3, unit: 'g', calories: 2.7 },
        carbohydrate: { amount: 8, unit: 'g', calories: 32 },
      },
    },
    daysAgo: 5,
  },
  {
    content:
      '저녁에 연어 스테이크와 아스파라거스를 구워 먹었다. 건강한 식단으로 만족스러웠다.',
    totalCalories: 450,
    calorieBreakdown: {
      연어: {
        protein: { amount: 25, unit: 'g', calories: 100 },
        fat: { amount: 13, unit: 'g', calories: 117 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      아스파라거스: {
        protein: { amount: 2.2, unit: 'g', calories: 8.8 },
        fat: { amount: 0.1, unit: 'g', calories: 0.9 },
        carbohydrate: { amount: 4, unit: 'g', calories: 16 },
      },
      올리브오일: {
        protein: { amount: 0, unit: 'g', calories: 0 },
        fat: { amount: 14, unit: 'g', calories: 126 },
        carbohydrate: { amount: 0, unit: 'g', calories: 0 },
      },
      레몬: {
        protein: { amount: 0.6, unit: 'g', calories: 2.4 },
        fat: { amount: 0.2, unit: 'g', calories: 1.8 },
        carbohydrate: { amount: 5, unit: 'g', calories: 20 },
      },
    },
    daysAgo: 6,
  },
];

// 비밀번호 해시 함수
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// 날짜 계산 함수
function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function main() {
  console.log('🌱 데이터베이스 시딩 시작...');
  console.log('📋 환경 설정:', {
    NODE_ENV: process.env.NODE_ENV,
    DEV_MODE: process.env.DEV_MODE,
    isDevelopmentMode: isDevelopmentMode,
  });

  // 기존 데이터 정리
  console.log('🧹 기존 데이터 정리 중...');
  await prisma.refreshToken.deleteMany();
  await prisma.diary.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 사용자 생성 중...');
  
  // 생성될 계정 정보 미리 출력
  console.log('📝 생성될 계정:');
  mockUsers.forEach(user => {
    console.log(`  - ${user.email} / ${user.password}`);
  });

  for (let i = 0; i < mockUsers.length; i++) {
    const userData = mockUsers[i];
    const hashedPassword = await hashPassword(userData.password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        targetCalories: userData.targetCalories,
      },
    });

    console.log(`✅ 사용자 생성됨: ${user.email} (ID: ${user.id})`);

    // 각 사용자에게 일기 데이터 추가
    console.log(`📖 ${user.email}의 일기 데이터 생성 중...`);

    // 사용자별로 다른 일기 조합 생성
    const diaryCount = Math.min(mockDiaries.length, 4 + i); // 사용자별로 다른 수의 일기

    for (let j = 0; j < diaryCount; j++) {
      const diaryData = mockDiaries[j];
      const createdDate = getDateDaysAgo(diaryData.daysAgo + i); // 사용자별로 다른 날짜

      const diary = await prisma.diary.create({
        data: {
          content: diaryData.content,
          userId: user.id,
          totalCalories: diaryData.totalCalories,
          calorieBreakdown: diaryData.calorieBreakdown,
          createdAt: createdDate,
          updatedAt: createdDate,
        } as any,
      });

      console.log(
        `  📝 일기 생성됨: ${diary.id} (${createdDate.toISOString().split('T')[0]})`,
      );
    }
  }

  // 추가 목업 사용자 (많은 데이터를 가진 사용자)
  console.log('🎯 고급 사용자 생성 중...');
  const powerUser = await prisma.user.create({
    data: {
      email: 'poweruser@example.com',
      password: await hashPassword('power123456'),
      targetCalories: 2500,
    },
  });

  // 파워 유저를 위한 더 많은 일기 데이터
  const additionalDiaries = [
    {
      content: '아침 운동 후 프로틴 쉐이크와 바나나를 먹었다.',
      totalCalories: 280,
      calorieBreakdown: {
        프로틴파우더: {
          protein: { amount: 25, unit: 'g', calories: 100 },
          fat: { amount: 2, unit: 'g', calories: 18 },
          carbohydrate: { amount: 5, unit: 'g', calories: 20 },
        },
        바나나: {
          protein: { amount: 1.1, unit: 'g', calories: 4.4 },
          fat: { amount: 0.3, unit: 'g', calories: 2.7 },
          carbohydrate: { amount: 27, unit: 'g', calories: 108 },
        },
        우유: {
          protein: { amount: 8, unit: 'g', calories: 32 },
          fat: { amount: 8, unit: 'g', calories: 72 },
          carbohydrate: { amount: 12, unit: 'g', calories: 48 },
        },
      },
      daysAgo: 0,
    },
    {
      content:
        '회사 동료들과 삼겹살 파티를 했다. 즐거운 시간이었지만 칼로리 오버!',
      totalCalories: 850,
      calorieBreakdown: {
        삼겹살: {
          protein: { amount: 18, unit: 'g', calories: 72 },
          fat: { amount: 35, unit: 'g', calories: 315 },
          carbohydrate: { amount: 0, unit: 'g', calories: 0 },
        },
        쌈채소: {
          protein: { amount: 2, unit: 'g', calories: 8 },
          fat: { amount: 0.3, unit: 'g', calories: 2.7 },
          carbohydrate: { amount: 6, unit: 'g', calories: 24 },
        },
        쌈장: {
          protein: { amount: 3, unit: 'g', calories: 12 },
          fat: { amount: 2, unit: 'g', calories: 18 },
          carbohydrate: { amount: 15, unit: 'g', calories: 60 },
        },
        소주: {
          protein: { amount: 0, unit: 'g', calories: 0 },
          fat: { amount: 0, unit: 'g', calories: 0 },
          carbohydrate: { amount: 0, unit: 'g', calories: 100 },
        },
        밥: {
          protein: { amount: 5, unit: 'g', calories: 20 },
          fat: { amount: 0.8, unit: 'g', calories: 7.2 },
          carbohydrate: { amount: 45, unit: 'g', calories: 180 },
        },
      },
      daysAgo: 7,
    },
  ];

  for (const diaryData of [...mockDiaries, ...additionalDiaries]) {
    const createdDate = getDateDaysAgo(diaryData.daysAgo);

    await prisma.diary.create({
      data: {
        content: diaryData.content,
        userId: powerUser.id,
        totalCalories: diaryData.totalCalories,
        calorieBreakdown: diaryData.calorieBreakdown,
        createdAt: createdDate,
        updatedAt: createdDate,
      } as any,
    });
  }

  console.log(
    `✅ 파워 유저 생성됨: ${powerUser.email} (${mockDiaries.length + additionalDiaries.length}개 일기)`,
  );

  console.log('\n🎉 시딩 완료!');
  console.log('\n📊 생성된 데이터 요약:');

  const totalUsers = await prisma.user.count();
  const totalDiaries = await prisma.diary.count();

  console.log(`👥 총 사용자: ${totalUsers}명`);
  console.log(`📖 총 일기: ${totalDiaries}개`);

  console.log('\n🔑 테스트 계정 정보:');
  
  // 실제 생성된 계정 정보 표시
  const allUsers = await prisma.user.findMany({
    select: { email: true, targetCalories: true },
    orderBy: { createdAt: 'asc' }
  });
  
  allUsers.forEach((user, index) => {
    const originalData = index < mockUsers.length ? mockUsers[index] : null;
    if (originalData) {
      console.log(`  📧 ${user.email} | 🔐 ${originalData.password} | 🎯 ${user.targetCalories || 0}kcal`);
    }
  });
  
  // 파워유저 추가
  console.log('  📧 poweruser@example.com | 🔐 power123456 | 🎯 2500kcal');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
