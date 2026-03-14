/**
 * 数据脱敏与过滤逻辑
 * 
 * 核心目标：
 * 1. 保护核心资产：移除付费项的倍率公式、Boss 属性等关键字段。
 * 2. 维持前端展示：保留 ID、Name、Description 等 UI 指导性字段。
 * 3. 注入锁定状态：增加 isLocked 字段协助前端渲染并阻断计算。
 */

// UI 必须保留的基础字段清单
const PRESERVED_FIELDS = [
    'ID', 'Name', 'Description', 
    'ClassID', 'ClassName', 
    'DungeonID', 'DungeonName', 
    'Race', 'difficulty', 'DungeonImportanceWeight',
    'isPremium'
];

/**
 * 递归脱敏单个数据节点
 */
function maskItem(item: any): any {
    if (typeof item !== 'object' || item === null) return item;

    // 如果该项是付费的，且没有 VIP 权限，则进行脱敏
    if (item.isPremium) {
        const masked: any = { isLocked: true };
        PRESERVED_FIELDS.forEach(field => {
            if (item[field] !== undefined) {
                masked[field] = item[field];
            }
        });
        return masked;
    }

    // 非付费项或嵌套结构，注入 isLocked: false 标识
    const newItem: any = Array.isArray(item) ? [] : { isLocked: false };
    
    for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
            // 递归处理子项（如副本下的 Monster 列表或技能分组）
            if (typeof item[key] === 'object' && item[key] !== null) {
                newItem[key] = maskItem(item[key]);
            } else {
                newItem[key] = item[key];
            }
        }
    }
    
    return newItem;
}

/**
 * 过滤数据
 * @param allData 聚合后的全量数据对象
 * @param role 访问权限角色：'free' | 'premium'
 */
export function filterData(allData: any, role: 'free' | 'premium'): any {
    if (role === 'premium') {
        // VIP 权限：遍历注入 isLocked: false，不删除任何字段
        return setLockedStatus(allData, false);
    }
    
    // 免费权限：执行脱敏过滤
    const filtered = { ...allData };
    
    // 1. 处理职业
    if (filtered.classes) {
        filtered.classes = filtered.classes.map((cls: any) => maskItem(cls));
    }
    
    // 2. 处理副本
    if (filtered.dungeons) {
        filtered.dungeons = filtered.dungeons.map((dg: any) => maskItem(dg));
    }
    
    // 3. 处理副本怪兽（特殊逻辑：过滤掉不存在的副本怪兽）
    if (filtered.dungeons_monsters) {
        const allowedDungeonIds = new Set(
            filtered.dungeons
                .map((dg: any) => dg.DungeonID)
        );
        
        const newMonsters: any = {};
        for (const dgId in filtered.dungeons_monsters) {
            if (allowedDungeonIds.has(dgId)) {
                // 注意：如果副本被锁，怪兽属性也要脱敏
                const isParentLocked = filtered.dungeons.find((d: any) => d.DungeonID === dgId)?.isLocked;
                if (isParentLocked) {
                    newMonsters[dgId] = filtered.dungeons_monsters[dgId].map((m: any) => ({
                        MonsterID: m.MonsterID,
                        MonsterName: m.MonsterName,
                        DungeonLevel: m.DungeonLevel,
                        isLocked: true
                    }));
                } else {
                    newMonsters[dgId] = filtered.dungeons_monsters[dgId].map((m: any) => ({ ...m, isLocked: false }));
                }
            }
        }
        filtered.dungeons_monsters = newMonsters;
    }

    // 4. 处理技能（按职业 ID 过滤）
    if (filtered.skills) {
        const newSkills: any = {};
        const classesMap = new Map(filtered.classes.map((c: any) => [c.ClassID, c.isLocked]));
        
        for (const classId in filtered.skills) {
            if (classesMap.has(classId)) {
                const isClassLocked = classesMap.get(classId);
                if (isClassLocked) {
                    // 如果职业被锁，技能也要脱敏
                    newSkills[classId] = maskSkillGroup(filtered.skills[classId]);
                } else {
                    newSkills[classId] = setLockedStatus(filtered.skills[classId], false);
                }
            }
        }
        filtered.skills = newSkills;
    }

    // 5. 其他数据（Buff, RankConfig）目前不设付费点，仅注入状态
    if (filtered.combat_buffs) filtered.combat_buffs = filtered.combat_buffs.map((b: any) => ({ ...b, isLocked: false }));
    if (filtered.rank_config) filtered.rank_config = filtered.rank_config.map((r: any) => ({ ...r, isLocked: false }));

    return filtered;
}

/**
 * 递归注入锁定状态标识
 */
function setLockedStatus(item: any, status: boolean): any {
    if (typeof item !== 'object' || item === null) return item;
    
    const newItem: any = Array.isArray(item) ? [] : { isLocked: status };
    for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
            newItem[key] = setLockedStatus(item[key], status);
        }
    }
    return newItem;
}

/**
 * 技能组脱敏辅助
 */
function maskSkillGroup(groups: any): any {
    const masked: any = { isLocked: true };
    for (const groupName in groups) {
        masked[groupName] = groups[groupName].map((s: any) => ({
            SkillID: s.SkillID,
            SkillName: s.SkillName,
            SkillImportanceWeight: 0,
            SkillFrequency: 0,
            isLocked: true
        }));
    }
    return masked;
}
