import { calculateMonsterPower, calculateDamage } from './calculator';
import type { CharacterAttributes, Skill, Monster, Buff } from '../types';

const mockChar: CharacterAttributes = {
    CharacterMinAttack: 1000,
    CharacterMaxAttack: 2000,
    CharacterDefense: 500,
    CharacterHealth: 5000,
    CharacterMana: 2000,
    CharacterCriticalHitDamagePercent: 200,
    CharacterMonsterDamageIncreasePercent: 0
};

const mockSkillA: Skill = {
    SkillID: 'A',
    SkillName: 'Skill A',
    RequiredClass: 'TEST',
    Faction: 'XIAN',
    SkillImportanceWeight: 1.0,
    SkillFrequency: 1,
    Cooldown: 10,
    CastTime: 1,
    IsAOE: false,
    SkillBonusAttributes: {
        SkillAttackPercentBonus: 0,
        SkillAttackFixedBonus: 0,
        SkillDamageBonus: 0
    }
};

const mockMonster: Monster = {
    MonsterID: 'M1',
    MonsterName: 'Test Monster',
    DungeonLevel: 1,
    MonsterAttributeModifiers: {
        MonsterCriticalDamagePercentReduction: 0
    }
};

const mockBuffs: Buff[] = [];

// Test 1: Basic Damage
// Min Base = 1000
// Max Base = 2000
// Crit Multiplier = 200% / 100 = 2.0
// Final Min = 1000 * 2 = 2000
// Final Max = 2000 * 2 = 4000
// Avg = 3000
console.log('--- Test 1: Basic Damage ---');
const dmg = calculateDamage(mockChar, mockSkillA, mockMonster, mockBuffs);
console.log('Expected Avg: 3000');
console.log('Actual Avg:', dmg.avgFinalDamage);

// Test 2: Monster Power (Design Doc Example Logic)
// Skill A: Avg 100, Weight 1.0 -> 100
// Skill B: Avg 80, Weight 0.5 -> 40
// Skill C: Avg 120, Weight 1.2 -> 144
// Total = 284

// I need to reverse engineer the char/skill stats to get exactly 100, 80, 120 avg damage.
// Or I can just trust the formula implementation `total += avg * weight`.
// Let's just check if the summation works.

// No, I can't easily override the internal call. 
// I'll just create skills that result in those damages.
// If Char has 0 attack, and Skill has Fixed Bonus = 100.
// And Crit = 100 (1x). 
// Then Avg = 100.

const zeroChar: CharacterAttributes = {
    ...mockChar,
    CharacterMinAttack: 0,
    CharacterMaxAttack: 0,
    CharacterCriticalHitDamagePercent: 100, // 1x
};

const sA: Skill = { ...mockSkillA, SkillImportanceWeight: 1.0, SkillBonusAttributes: { SkillAttackFixedBonus: 100 } };
const sB: Skill = { ...mockSkillA, SkillImportanceWeight: 0.5, SkillBonusAttributes: { SkillAttackFixedBonus: 80 } };
const sC: Skill = { ...mockSkillA, SkillImportanceWeight: 1.2, SkillBonusAttributes: { SkillAttackFixedBonus: 120 } };

console.log('--- Test 2: Monster Power Summation ---');
const power = calculateMonsterPower(zeroChar, [sA, sB, sC], mockMonster, []);
console.log('Expected Power: 100*1 + 80*0.5 + 120*1.2 = 100 + 40 + 144 = 284');
console.log('Actual Power:', power);
