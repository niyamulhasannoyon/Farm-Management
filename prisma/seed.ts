import { PrismaClient, Role, FlockStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Seed data provided in prompt for Flock 2866, Shed 01, Ross
const FLOCK_2866_RECORDS = [
  { weekEndDate: '2025-07-12', ageWeeks: 1, housedF: 9211, housedM: 1340, mortalityF: 280, mortalityM: 53, soldF: 0, soldM: 0, stdWeightF: 115, actualWeightF: 161 },
  { weekEndDate: '2025-07-19', ageWeeks: 2, housedF: 8931, housedM: 1287, mortalityF: 118, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 215, actualWeightF: 314 },
  { weekEndDate: '2025-07-26', ageWeeks: 3, housedF: 8813, housedM: 1225, mortalityF: 125, mortalityM: 62, soldF: 0, soldM: 0, stdWeightF: 335, actualWeightF: 444 },
  { weekEndDate: '2025-08-02', ageWeeks: 4, housedF: 8688, housedM: 1163, mortalityF: 17, mortalityM: 33, soldF: 0, soldM: 0, stdWeightF: 465, actualWeightF: 556 },
  { weekEndDate: '2025-08-09', ageWeeks: 5, housedF: 8671, housedM: 1130, mortalityF: 4, mortalityM: 15, soldF: 0, soldM: 8, stdWeightF: 585, actualWeightF: 590 },
  { weekEndDate: '2025-08-16', ageWeeks: 6, housedF: 8667, housedM: 1107, mortalityF: 3, mortalityM: 1, soldF: 0, soldM: 46, stdWeightF: 695, actualWeightF: 706 },
  { weekEndDate: '2025-08-23', ageWeeks: 7, housedF: 8664, housedM: 1060, mortalityF: 4, mortalityM: 0, soldF: 4, soldM: 12, stdWeightF: 795, actualWeightF: 816 },
  { weekEndDate: '2025-08-30', ageWeeks: 8, housedF: 8656, housedM: 1048, mortalityF: 6, mortalityM: 0, soldF: 9, soldM: 10, stdWeightF: 895, actualWeightF: 873 },
  { weekEndDate: '2025-09-06', ageWeeks: 9, housedF: 8641, housedM: 1038, mortalityF: 4, mortalityM: 0, soldF: 0, soldM: 1, stdWeightF: 995, actualWeightF: 1012 },
  { weekEndDate: '2025-09-13', ageWeeks: 10, housedF: 8637, housedM: 1037, mortalityF: 1, mortalityM: 0, soldF: 0, soldM: 5, stdWeightF: 1095, actualWeightF: 1134 },
  { weekEndDate: '2025-09-20', ageWeeks: 11, housedF: 8636, housedM: 1032, mortalityF: 2, mortalityM: 1, soldF: 2, soldM: 10, stdWeightF: 1195, actualWeightF: 1240 },
  { weekEndDate: '2025-09-27', ageWeeks: 12, housedF: 8632, housedM: 1021, mortalityF: 5, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1295, actualWeightF: 1346 },
  { weekEndDate: '2025-10-04', ageWeeks: 13, housedF: 8627, housedM: 1020, mortalityF: 0, mortalityM: 5, soldF: 0, soldM: 2, stdWeightF: 1395, actualWeightF: 1457 },
  { weekEndDate: '2025-10-11', ageWeeks: 14, housedF: 8627, housedM: 1013, mortalityF: 1, mortalityM: 6, soldF: 0, soldM: 42, stdWeightF: 1495, actualWeightF: 1574 },
  { weekEndDate: '2025-10-18', ageWeeks: 15, housedF: 8626, housedM: 965, mortalityF: 7, mortalityM: 5, soldF: 26, soldM: 6, stdWeightF: 1595, actualWeightF: 1687 },
  { weekEndDate: '2025-10-25', ageWeeks: 16, housedF: 8593, housedM: 954, mortalityF: 6, mortalityM: 2, soldF: 50, soldM: 0, stdWeightF: 1705, actualWeightF: 1838 },
  { weekEndDate: '2025-11-01', ageWeeks: 17, housedF: 8537, housedM: 952, mortalityF: 7, mortalityM: 6, soldF: 3, soldM: 10, stdWeightF: 1825, actualWeightF: 1939 },
  { weekEndDate: '2025-11-08', ageWeeks: 18, housedF: 8527, housedM: 936, mortalityF: 1, mortalityM: 1, soldF: 0, soldM: 0, stdWeightF: 1950, actualWeightF: 2074 },
  { weekEndDate: '2025-11-15', ageWeeks: 19, housedF: 8526, housedM: 935, mortalityF: 5, mortalityM: 7, soldF: 0, soldM: 0, stdWeightF: 2085, actualWeightF: 2224 },
];

// Breed standard weight curve for Ross
const ROSS_STANDARD_WEIGHTS = [
  { ageWeeks: 1, stdWeightF: 115, stdWeightM: 125 },
  { ageWeeks: 2, stdWeightF: 215, stdWeightM: 235 },
  { ageWeeks: 3, stdWeightF: 335, stdWeightM: 370 },
  { ageWeeks: 4, stdWeightF: 465, stdWeightM: 515 },
  { ageWeeks: 5, stdWeightF: 585, stdWeightM: 650 },
  { ageWeeks: 6, stdWeightF: 695, stdWeightM: 775 },
  { ageWeeks: 7, stdWeightF: 795, stdWeightM: 890 },
  { ageWeeks: 8, stdWeightF: 895, stdWeightM: 1000 },
  { ageWeeks: 9, stdWeightF: 995, stdWeightM: 1115 },
  { ageWeeks: 10, stdWeightF: 1095, stdWeightM: 1230 },
  { ageWeeks: 11, stdWeightF: 1195, stdWeightM: 1345 },
  { ageWeeks: 12, stdWeightF: 1295, stdWeightM: 1460 },
  { ageWeeks: 13, stdWeightF: 1395, stdWeightM: 1575 },
  { ageWeeks: 14, stdWeightF: 1495, stdWeightM: 1690 },
  { ageWeeks: 15, stdWeightF: 1595, stdWeightM: 1805 },
  { ageWeeks: 16, stdWeightF: 1705, stdWeightM: 1925 },
  { ageWeeks: 17, stdWeightF: 1825, stdWeightM: 2050 },
  { ageWeeks: 18, stdWeightF: 1950, stdWeightM: 2180 },
  { ageWeeks: 19, stdWeightF: 2085, stdWeightM: 2320 },
  { ageWeeks: 20, stdWeightF: 2225, stdWeightM: 2470 },
];

async function main() {
  console.log('🌱 Starting database seed for RBCL Flock Monitor...');

  // 1. Seed Unit B
  const unitB = await prisma.unit.upsert({
    where: { code: 'B' },
    update: { name: 'Unit B' },
    create: {
      code: 'B',
      name: 'Unit B',
    },
  });
  console.log(`✓ Unit created: ${unitB.name} (${unitB.code})`);

  // 2. Seed Shed 01
  const shed01 = await prisma.shed.upsert({
    where: {
      unitId_shedNo: {
        unitId: unitB.id,
        shedNo: '01',
      },
    },
    update: {},
    create: {
      unitId: unitB.id,
      shedNo: '01',
    },
  });
  console.log(`✓ Shed created: Shed ${shed01.shedNo}`);

  // Also seed Shed 02 & Shed 03 for multi-shed comparison
  await prisma.shed.upsert({
    where: { unitId_shedNo: { unitId: unitB.id, shedNo: '02' } },
    update: {},
    create: { unitId: unitB.id, shedNo: '02' },
  });
  await prisma.shed.upsert({
    where: { unitId_shedNo: { unitId: unitB.id, shedNo: '03' } },
    update: {},
    create: { unitId: unitB.id, shedNo: '03' },
  });

  // 3. Seed Standard Weight curves for Ross breed
  for (const sw of ROSS_STANDARD_WEIGHTS) {
    await prisma.standardWeight.upsert({
      where: {
        breed_ageWeeks: {
          breed: 'Ross',
          ageWeeks: sw.ageWeeks,
        },
      },
      update: {
        stdWeightF: sw.stdWeightF,
        stdWeightM: sw.stdWeightM,
      },
      create: {
        breed: 'Ross',
        ageWeeks: sw.ageWeeks,
        stdWeightF: sw.stdWeightF,
        stdWeightM: sw.stdWeightM,
      },
    });
  }
  console.log('✓ Standard weight curves seeded for Ross breed (ages 1-20)');

  // 4. Seed Alert Thresholds
  await prisma.alertThreshold.upsert({
    where: { breed: 'Ross' },
    update: {
      weeklyMortalityPctThreshold: 1.0,
      weightDevPctThreshold: 10.0,
      minAgeWeeksForWeightAlert: 4,
    },
    create: {
      breed: 'Ross',
      weeklyMortalityPctThreshold: 1.0,
      weightDevPctThreshold: 10.0,
      minAgeWeeksForWeightAlert: 4,
    },
  });
  console.log('✓ Alert thresholds seeded (mortality > 1.0%, weight dev > 10% from week 4)');

  // 5. Seed Users & Profiles
  const demoUsers = [
    { email: 'admin@rbcl.farm', fullName: 'RBCL Admin', role: Role.ADMIN },
    { email: 'manager@rbcl.farm', fullName: 'Farm Manager', role: Role.MANAGER },
    { email: 'staff@rbcl.farm', fullName: 'Field Staff (Data Entry)', role: Role.DATA_ENTRY },
    { email: 'viewer@rbcl.farm', fullName: 'Auditor (Viewer)', role: Role.VIEWER },
  ];

  for (const user of demoUsers) {
    await prisma.profile.upsert({
      where: { email: user.email },
      update: { role: user.role, fullName: user.fullName },
      create: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  }
  console.log('✓ Demo profiles created (Admin, Manager, Data Entry, Viewer)');

  // 6. Seed Flock 2866
  const flock2866 = await prisma.flock.upsert({
    where: {
      unitId_flockNo: {
        unitId: unitB.id,
        flockNo: '2866',
      },
    },
    update: {
      shedId: shed01.id,
      breed: 'Ross',
      housingDate: new Date('2025-07-05'),
      status: FlockStatus.ACTIVE,
    },
    create: {
      unitId: unitB.id,
      shedId: shed01.id,
      flockNo: '2866',
      breed: 'Ross',
      housingDate: new Date('2025-07-05'),
      status: FlockStatus.ACTIVE,
    },
  });
  console.log(`✓ Flock created: Flock ${flock2866.flockNo} in Shed 01`);

  // 7. Seed Weekly Records for Flock 2866 (Weeks 1 to 19)
  for (const record of FLOCK_2866_RECORDS) {
    await prisma.weeklyRecord.upsert({
      where: {
        flockId_ageWeeks: {
          flockId: flock2866.id,
          ageWeeks: record.ageWeeks,
        },
      },
      update: {
        weekEndDate: new Date(record.weekEndDate),
        housedF: record.housedF,
        housedM: record.housedM,
        mortalityF: record.mortalityF,
        mortalityM: record.mortalityM,
        soldF: record.soldF,
        soldM: record.soldM,
        stdWeightF: record.stdWeightF,
        actualWeightF: record.actualWeightF,
      },
      create: {
        flockId: flock2866.id,
        ageWeeks: record.ageWeeks,
        weekEndDate: new Date(record.weekEndDate),
        housedF: record.housedF,
        housedM: record.housedM,
        mortalityF: record.mortalityF,
        mortalityM: record.mortalityM,
        soldF: record.soldF,
        soldM: record.soldM,
        stdWeightF: record.stdWeightF,
        actualWeightF: record.actualWeightF,
      },
    });
  }
  console.log('✓ Seeded 19 weeks of historical real data for Flock 2866');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
