import type {
    CharacterClass,
    AllSkills,
    Buff,
    Dungeon,
    Monster,
    RankConfig
} from '../types';

const API_URL = '/api/getData';

export class DataService {
    private static instance: DataService;

    private classes: CharacterClass[] | null = null;
    private skills: AllSkills | null = null;
    private dungeonsMetadata: any[] | null = null;
    private dungeonsMonsters: Record<string, Monster[]> | null = null;
    private buffs: Buff[] | null = null;
    private rankConfigs: RankConfig[] | null = null;

    private status: 'free' | 'premium' | 'invalid' = 'free';
    private version: string = '';

    private constructor() { }

    public static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }

    /**
     * 从后端 API 加载聚合后的全量数据
     * @param vipCode 可选的卡密
     */
    public async loadAllData(vipCode?: string): Promise<{ status: string; version: string }> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (vipCode) {
            headers['X-VIP-Code'] = vipCode.trim();
        }

        try {
            const response = await fetch(API_URL, { headers });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const result = await response.json();
            const { data, status, version } = result;

            this.classes = data.classes;
            this.skills = data.skills;
            this.dungeonsMetadata = data.dungeons;
            this.dungeonsMonsters = data.dungeons_monsters;
            this.buffs = data.combat_buffs;
            this.rankConfigs = data.rank_config;
            this.status = status;
            this.version = version;

            return { status, version };
        } catch (error) {
            console.error('Failed to load data:', error);
            // 这里可以考虑注入极简的内置兜底数据，或者抛出异常由 UI 处理
            throw error;
        }
    }

    public getStatus() { return this.status; }
    public getVersion() { return this.version; }

    public getClasses(): CharacterClass[] {
        return this.classes || [];
    }

    public getSkills(classId: string): Record<string, any[]> | null {
        return this.skills ? this.skills[classId] : null;
    }

    public getDungeons(): Dungeon[] {
        if (!this.dungeonsMetadata || !this.dungeonsMonsters) return [];

        return this.dungeonsMetadata.map((meta: any) => {
            const monsters = this.dungeonsMonsters![meta.DungeonID] || [];
            return {
                ...meta,
                Monsters: monsters
            };
        });
    }

    public getBuffs(): Buff[] {
        return this.buffs || [];
    }

    public getRankConfigs(): RankConfig[] {
        return this.rankConfigs || [];
    }
}
