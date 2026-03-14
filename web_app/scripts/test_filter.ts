import { filterData } from '../functions/utils/filter.ts';

// 模拟数据
const mockDungeons = [
  { DungeonID: "FREE_1", DungeonName: "免费副本", isPremium: false },
  { DungeonID: "PREMIUM_1", DungeonName: "付费副本", isPremium: true }
];

const mockClasses = [
  { ClassID: "FREE_C", ClassName: "免费职业" },
  { ClassID: "PREMIUM_C", ClassName: "付费职业", isPremium: true }
];

const mockSkills = {
  "FREE_C": { "Active": [ { SkillID: "S1", SkillName: "免费技能" } ] },
  "PREMIUM_C": { "Active": [ { SkillID: "S2", SkillName: "付费技能", isPremium: true } ] }
};

const fullData = {
  dungeons: mockDungeons,
  classes: mockClasses,
  skills: mockSkills,
  dungeons_monsters: {},
  combat_buffs: [],
  rank_config: []
};

console.log("=== 开始验证数据过滤逻辑 ===");

// 1. 验证 Free 模式
const freeResult = filterData(JSON.parse(JSON.stringify(fullData)), 'free');
const freeDungeon = freeResult.dungeons.find((d: any) => d.DungeonID === "PREMIUM_1");
const freeClass = freeResult.classes.find((c: any) => c.ClassID === "PREMIUM_C");

console.log("Free 模式验证:");
console.log("- 付费副本是否标记锁定:", freeDungeon?.isLocked === true);
console.log("- 付费职业是否标记锁定:", freeClass?.isLocked === true);
console.log("- 付费职业名称是否保留:", freeClass?.ClassName === "付费职业");

if (freeDungeon?.isLocked && freeClass?.isLocked) {
  console.log("✅ Free 模式验证通过");
} else {
  console.log("❌ Free 模式验证失败");
  process.exit(1);
}

// 2. 验证 Premium 模式
const premiumResult = filterData(JSON.parse(JSON.stringify(fullData)), 'premium');
const premiumDungeon = premiumResult.dungeons.find((d: any) => d.DungeonID === "PREMIUM_1");
console.log("\nPremium 模式验证:");
console.log("- 付费副本是否未锁定:", premiumDungeon?.isLocked !== true);

if (premiumDungeon && !premiumDungeon.isLocked) {
  console.log("✅ Premium 模式验证通过");
} else {
  console.log("❌ Premium 模式验证失败");
  process.exit(1);
}

console.log("\n=== 所有验证项通过 ===");
