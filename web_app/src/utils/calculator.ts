import { CharacterAttributes, Skill, Monster, Buff } from '../types';

interface DamageResult {
    minBaseDamage: number;
    maxBaseDamage: number;
    minFinalDamage: number;
    maxFinalDamage: number;
    avgFinalDamage: number;
}

export const calculateDamage = (
    character: CharacterAttributes,
    skill: Skill,
    monster: Monster,
    activeBuffs: Buff[]
): DamageResult => {
    // 1. Aggregate Buff Effects
    let buffAttackPercent = 0;
    let buffAttackFixed = 0;
    let buffDefensePercent = 0;
    let buffHealthPercent = 0;
    let buffManaPercent = 0;
    let buffCritDmg = 0;
    let buffFocus = 0;
    let buffHolyWrath = 0;
    let buffMonCritDmg = 0;
    let buffMonHarmed = 0;
    // ... other buffs

    activeBuffs.forEach(buff => {
        const effects = buff.BuffEffects;
        buffAttackPercent += effects.BuffAttackPercentEffect || 0;
        buffAttackFixed += effects.BuffAttackFixedEffect || 0;
        buffDefensePercent += effects.BuffDefensePercentEffect || 0;
        buffHealthPercent += effects.BuffHealthPercentEffect || 0;
        buffManaPercent += effects.BuffManaPercentEffect || 0;
        buffCritDmg += effects.BuffCriticalDamagePercentEffect || 0;
        buffFocus += effects.BuffFocusPercentEffect || 0;
        buffHolyWrath += effects.BuffHolyWrathPercentEffect || 0;
        buffMonCritDmg += effects.BuffMonsterCriticalDamagePercentEffect || 0;
        buffMonHarmed += effects.BuffMonsterHarmedPercentEffect || 0;
    });

    // 2. Calculate Base Damage
    // Formula: (CharAttack * (1 + SkillAtt%)) + SkillFixed + (Health * SkillHealth%) + (Mana * SkillMana%) + (Def * SkillDef%)
    // Note: Buffs might affect CharAttack/Health/etc directly or be additive to Skill%. 
    // The design doc says "BuffAttackPercentEffect" but doesn't explicitly say if it adds to SkillAttackPercent or multiplies CharacterAttack.
    // Usually in games: BaseAttack = CharAttack * (1 + BuffAttack%). 
    // But the doc formula for Base Damage is:
    // (角色最小攻击 * (1 + 技能附加攻击百分比 / 100)) + ...
    // It doesn't show where BuffAttackPercent goes in Base Damage.
    // However, in Final Damage, it lists specific buffs like Focus, HolyWrath.
    // Let's assume generic attribute buffs (Attack%, Health%) modify the Character Attributes BEFORE the skill formula, 
    // OR they are additive to the skill multipliers.
    // Given the doc lists "BuffAttackPercentEffect" under "Combat Buffs" but the formula for Final Damage ONLY lists Focus, HolyWrath, MonHarmed, etc.
    // I will assume for now that Attribute Buffs modify the Character Attributes.
    // EffectiveCharMinAttack = CharacterMinAttack * (1 + buffAttackPercent / 100) + buffAttackFixed

    const effMinAttack = character.CharacterMinAttack * (1 + buffAttackPercent / 100) + buffAttackFixed;
    const effMaxAttack = character.CharacterMaxAttack * (1 + buffAttackPercent / 100) + buffAttackFixed;
    const effHealth = character.CharacterHealth * (1 + buffHealthPercent / 100); // + fixed if any
    const effMana = character.CharacterMana * (1 + buffManaPercent / 100);
    const effDefense = character.CharacterDefense * (1 + buffDefensePercent / 100);

    const skillBonus = skill.SkillBonusAttributes;

    const minBaseDamage =
        (effMinAttack * (1 + (skillBonus.SkillAttackPercentBonus || 0) / 100)) +
        (skillBonus.SkillAttackFixedBonus || 0) +
        (effHealth * (skillBonus.SkillHealthPercentBonus || 0) / 100) +
        (effMana * (skillBonus.SkillManaPercentBonus || 0) / 100) +
        (effDefense * (skillBonus.SkillDefensePercentBonus || 0) / 100);

    const maxBaseDamage =
        (effMaxAttack * (1 + (skillBonus.SkillAttackPercentBonus || 0) / 100)) +
        (skillBonus.SkillAttackFixedBonus || 0) +
        (effHealth * (skillBonus.SkillHealthPercentBonus || 0) / 100) +
        (effMana * (skillBonus.SkillManaPercentBonus || 0) / 100) +
        (effDefense * (skillBonus.SkillDefensePercentBonus || 0) / 100);

    // 3. Calculate Final Damage
    // Multipliers:
    // CritMultiplier = (CharCritDmg + BuffCritDmg + BuffMonCritDmg + SkillCritDmg - MonCritReduc) / 100
    // DmgBonusMultiplier = (1 + SkillDmgBonus / 100)  <-- Note: SkillDamageBonus might be a multiplier (e.g. 1) or percent. Doc says "SkillDamageBonus" (e.g. 1) and formula says "1 + SkillDamageBonus / 100". 
    // Wait, in skills.json, "SkillDamageBonus": 1. If it's 1, and formula is /100, that's 1.01x. That seems low. 
    // Or maybe "SkillDamageBonus" in json is 1 meaning 100%? Or is it a multiplier like 1.5?
    // Doc says: "技能伤害增加倍数 (SkillDamageBonus)". If it's "倍数" (Multiplier), then it might be just `SkillDamageBonus`.
    // BUT the formula says `(1 + 技能伤害增加倍数 / 100)`. This implies it's a percentage value in the formula context.
    // Let's check skills.json again. "SkillDamageBonus": 1. 
    // If it is "倍数", maybe it means "Increases by 1x" (i.e. +100%)?
    // Or maybe the formula meant `* SkillDamageBonus` directly?
    // Let's look at "SkillAttackPercentBonus": 240. This is clearly %.
    // "SkillDamageBonus": 1. If this is %, it's negligible.
    // If it is a multiplier, e.g. 1.0, then `* 1` does nothing.
    // If it is "Add 100% damage", then it should be 100?
    // Let's assume for now it is a multiplier value that should be treated as (1 + Value) or just Value.
    // Re-reading doc: "技能伤害增加倍数 (SkillDamageBonus)".
    // Formula: `(1 + 技能伤害增加倍数 / 100)`.
    // If json has 1, and it means 1%, it's tiny.
    // If json has 1, and it means 1x (doubled), then the formula should be `(1 + SkillDamageBonus)` if SkillDamageBonus is 1.
    // OR `(1 + SkillDamageBonus * 100 / 100)`.
    // Let's look at other skills. "SkillDamageBonus": 3 for "九刃齐歌".
    // If it's 3%, it's small. If it's 3x (300% increase), it's huge.
    // "倍数" usually means "times". "增加倍数" means "increased by X times".
    // So 1 means +100% (2x total). 3 means +300% (4x total).
    // So the formula `(1 + Value)` makes sense if Value is 1 or 3.
    // But the formula written in doc is `(1 + ... / 100)`. This suggests the author might have copied the pattern or the unit in JSON is different.
    // Given "SkillAttackPercentBonus": 240 (240%), I suspect "SkillDamageBonus": 1 means 100% or 1.0 coefficient.
    // I will assume `SkillDamageBonus` in JSON is a direct multiplier addition (e.g. 1 = +100%).
    // So the term is `(1 + skillBonus.SkillDamageBonus)`.
    // I will IGNORE the `/ 100` from the doc for this specific field if the value is small like 1 or 3, 
    // OR I will assume the doc meant `(1 + SkillDamageBonus)` and the `/ 100` was a typo from copy-paste.
    // Let's stick to `(1 + skillBonus.SkillDamageBonus)` for now.

    const critDmgTotal =
        character.CharacterCriticalHitDamagePercent +
        buffCritDmg +
        buffMonCritDmg +
        (skillBonus.SkillCriticalDamagePercentBonus || 0) -
        monster.MonsterAttributeModifiers.MonsterCriticalDamagePercentReduction;

    // Ensure crit multiplier doesn't go below 0 (or 100%?)
    // Usually Crit Damage floor is 100% (normal hit) or 120% etc.
    // If CritDmgTotal is e.g. 500, multiplier is 5.0.
    const critMultiplier = Math.max(1, critDmgTotal / 100);

    const damageBonusMultiplier = 1 + (skillBonus.SkillDamageBonus || 0); // Assuming 1 = +100%

    const charMonDmgInc = 1 + character.CharacterMonsterDamageIncreasePercent / 100;

    const monHarmedMultiplier = 1 + buffMonHarmed / 100;
    const focusMultiplier = 1 + buffFocus / 100;
    const holyWrathMultiplier = 1 + buffHolyWrath / 100;

    const finalMultipliers =
        critMultiplier *
        damageBonusMultiplier *
        charMonDmgInc *
        monHarmedMultiplier *
        focusMultiplier *
        holyWrathMultiplier;

    const minFinalDamage = minBaseDamage * finalMultipliers;
    const maxFinalDamage = maxBaseDamage * finalMultipliers;

    return {
        minBaseDamage,
        maxBaseDamage,
        minFinalDamage,
        maxFinalDamage,
        avgFinalDamage: (minFinalDamage + maxFinalDamage) / 2
    };
};

export const calculateMonsterPower = (
    character: CharacterAttributes,
    skills: Skill[],
    monster: Monster,
    activeBuffs: Buff[]
): number => {
    // Formula: Σ(SkillAvgDamage * SkillWeight)
    // Note: The doc says "SkillWeight" (SkillImportanceWeight).
    // But it also mentions "SkillFrequency".
    // The "Latest Power Calculation Method" (4.3) says: MonsterPower = Σ(SkillAvgDamage * SkillWeight).
    // It ignores Frequency in the simplified formula 4.3.
    // I will follow 4.3 as it is labeled "Latest".

    let totalPower = 0;

    skills.forEach(skill => {
        const damage = calculateDamage(character, skill, monster, activeBuffs);
        totalPower += damage.avgFinalDamage * skill.SkillImportanceWeight;
    });

    return totalPower;
};

export const calculateDungeonPower = (
    character: CharacterAttributes,
    skills: Skill[],
    monsters: Monster[],
    activeBuffs: Buff[]
): number => {
    // Formula: Avg(MonsterPower)
    if (monsters.length === 0) return 0;

    let totalMonsterPower = 0;
    monsters.forEach(monster => {
        totalMonsterPower += calculateMonsterPower(character, skills, monster, activeBuffs);
    });

    return totalMonsterPower / monsters.length;
};

export const calculateTotalPower = (
    dungeonPowers: number[],
    weights: number[] // If we have weights for dungeons
): number => {
    // Formula: Weighted Avg
    if (dungeonPowers.length === 0) return 0;

    let totalWeightedPower = 0;
    let totalWeight = 0;

    dungeonPowers.forEach((power, index) => {
        const weight = weights[index] || 1;
        totalWeightedPower += power * weight;
        totalWeight += weight;
    });

    if (totalWeight === 0) return 0;
    return totalWeightedPower / totalWeight;
};
