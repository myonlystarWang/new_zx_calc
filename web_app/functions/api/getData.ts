import classes from '../data/classes.json';
import skills from '../data/skills.json';
import dungeons from '../data/dungeons.json';
import dungeons_monsters from '../data/dungeons_monsters.json';
import combat_buffs from '../data/combat_buffs.json';
import rank_config from '../data/rank_config.json';
import { filterData } from '../utils/filter';

/**
 * 诛仙3 副本战力计算器 - 数据获取接口
 * 聚合所有私有 JSON 数据，并执行基于卡密的权限过滤
 */

// 数据版本号，用于前端缓存控制
const DATA_VERSION = '20260314_V1';

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // 1. 获取卡密 (优先从 Header 获取，兼容 Query)
    let code = request.headers.get('X-VIP-Code') || url.searchParams.get('code') || '';
    code = code.trim().toLowerCase();

    // 2. 权限校验
    let isVIP = false;
    if (code && env.VIP_CODES) {
        const whiteList = env.VIP_CODES.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        isVIP = whiteList.includes(code);
    }

    // 3. 聚合原始数据
    const allData = {
        classes,
        skills,
        dungeons,
        dungeons_monsters,
        combat_buffs,
        rank_config
    };

    // 4. 执行过滤/脱敏
    const role = isVIP ? 'premium' : 'free';
    const filtered = filterData(allData, role);

    // 5. 返回结果
    return new Response(JSON.stringify({
        status: isVIP ? 'premium' : (code ? 'invalid' : 'free'),
        version: DATA_VERSION,
        data: filtered
    }), {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            // 禁止浏览器缓存此接口（权限可能随时变化）
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    });
};

// 环境变量定义
interface Env {
    VIP_CODES: string;
}
