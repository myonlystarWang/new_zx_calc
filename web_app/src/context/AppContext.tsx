import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CharacterAttributes, UserCharacter, CharacterClass, Buff } from '../types';
import { DataService } from '../services/DataService';

interface AppState {
    isLoading: boolean;
    classes: CharacterClass[];
    buffs: Buff[];
    userCharacter: UserCharacter;
    activeBuffIds: string[];
    buffValues: Record<string, number>;
    selectedDungeonId: string | null;
    vipCode: string;
    vipStatus: 'free' | 'premium' | 'invalid';
}

interface AppContextType extends AppState {
    updateCharacterAttributes: (attrs: CharacterAttributes) => void;
    updateCharacterClass: (classId: string, faction: 'XIAN' | 'FO' | 'MO') => void;
    toggleBuff: (buffId: string) => void;
    updateBuffValue: (buffId: string, value: number) => void;
    selectDungeon: (dungeonId: string) => void;
    activateVip: (code: string) => Promise<boolean>;
}

const defaultAttributes: CharacterAttributes = {
    CharacterMinAttack: 100000,
    CharacterMaxAttack: 120000,
    CharacterDefense: 5000,
    CharacterHealth: 1500000,
    CharacterMana: 1500000,
    CharacterCriticalHitDamagePercent: 1600,
    CharacterMonsterDamageIncreasePercent: 10
};

const defaultCharacter: UserCharacter = {
    UserID: 'guest',
    CharacterID: 'char_01',
    CharacterName: '道友',
    ClassID: 'ZHU_SHUANG',
    Faction: 'MO',
    Level: 170,
    BaseAttributes: defaultAttributes
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [classes, setClasses] = useState<CharacterClass[]>([]);
    const [buffs, setBuffs] = useState<Buff[]>([]);

    const [userCharacter, setUserCharacter] = useState<UserCharacter>(() => {
        const saved = localStorage.getItem('zx_user_character');
        return saved ? JSON.parse(saved) : defaultCharacter;
    });

    const [activeBuffIds, setActiveBuffIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('zx_active_buffs');
        return saved ? JSON.parse(saved) : [];
    });

    const [buffValues, setBuffValues] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('zx_buff_values');
        return saved ? JSON.parse(saved) : {};
    });

    const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(null);
    const [vipCode, setVipCode] = useState<string>(() => localStorage.getItem('zx_vip_code') || '');
    const [vipStatus, setVipStatus] = useState<'free' | 'premium' | 'invalid'>('free');

    const initData = async (codeToUse?: string) => {
        setIsLoading(true);
        const service = DataService.getInstance();
        
        try {
            const currentCode = codeToUse !== undefined ? codeToUse : vipCode;
            const { status, version } = await service.loadAllData(currentCode);
            
            // 版本校验：如果版本变了，清理旧的数据缓存（但不清理用户属性）
            const lastVersion = localStorage.getItem('zx_data_version');
            const shouldResetDataCache = !!(lastVersion && lastVersion !== version);
            if (shouldResetDataCache) {
                console.log(`Version change: ${lastVersion} -> ${version}. Flushing data cache.`);
                // 只清理数据相关的缓存，保留用户配置
                localStorage.removeItem('zx_active_buffs');
                localStorage.removeItem('zx_buff_values');
                setActiveBuffIds([]);
                setBuffValues({});
                // 强制角色合法性检查（可选）
            }
            localStorage.setItem('zx_data_version', version);

            setVipStatus(status as any);
            setClasses(service.getClasses());
            const loadedBuffs = service.getBuffs();
            setBuffs(loadedBuffs);

            const baseActiveBuffIds = shouldResetDataCache ? [] : activeBuffIds;
            const baseBuffValues = shouldResetDataCache ? {} : buffValues;

            // Set default buffs if empty
            if (baseActiveBuffIds.length === 0) {
                const defaults = loadedBuffs.filter(b => b.IsDefaultActive).map(b => b.BuffID);
                setActiveBuffIds(defaults);
            }

            // Initialize buff values if empty
            if (Object.keys(baseBuffValues).length === 0) {
                const initialValues: Record<string, number> = {};
                loadedBuffs.forEach(b => {
                    initialValues[b.BuffID] = b.DefaultEffectValue ?? 0;
                });
                setBuffValues(initialValues);
            }
        } catch (error) {
            console.error('Init failure:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        localStorage.setItem('zx_user_character', JSON.stringify(userCharacter));
    }, [userCharacter]);

    useEffect(() => {
        localStorage.setItem('zx_active_buffs', JSON.stringify(activeBuffIds));
    }, [activeBuffIds]);

    useEffect(() => {
        localStorage.setItem('zx_buff_values', JSON.stringify(buffValues));
    }, [buffValues]);

    useEffect(() => {
        localStorage.setItem('zx_vip_code', vipCode);
    }, [vipCode]);

    const activateVip = async (code: string): Promise<boolean> => {
        const cleanCode = code.trim();
        await initData(cleanCode);
        
        const service = DataService.getInstance();
        const finalStatus = service.getStatus();
        
        if (finalStatus === 'premium') {
            setVipCode(cleanCode);
            return true;
        }
        return false;
    };

    const updateCharacterAttributes = (attrs: CharacterAttributes) => {
        setUserCharacter(prev => ({
            ...prev,
            BaseAttributes: attrs
        }));
    };

    const updateCharacterClass = (classId: string, faction: 'XIAN' | 'FO' | 'MO') => {
        setUserCharacter(prev => ({
            ...prev,
            ClassID: classId,
            Faction: faction
        }));
    };

    const toggleBuff = (buffId: string) => {
        setActiveBuffIds(prev =>
            prev.includes(buffId) ? prev.filter(id => id !== buffId) : [...prev, buffId]
        );
    };

    const updateBuffValue = (buffId: string, value: number) => {
        setBuffValues(prev => ({
            ...prev,
            [buffId]: value
        }));
    };

    const selectDungeon = (dungeonId: string) => {
        setSelectedDungeonId(dungeonId);
    };

    return (
        <AppContext.Provider value={{
            isLoading,
            classes,
            buffs,
            userCharacter,
            activeBuffIds,
            buffValues,
            selectedDungeonId,
            vipCode,
            vipStatus,
            updateCharacterAttributes,
            updateCharacterClass,
            toggleBuff,
            updateBuffValue,
            selectDungeon,
            activateVip
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
