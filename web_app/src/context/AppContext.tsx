import React, { createContext, useContext, useState, useEffect } from 'react';
import { CharacterAttributes, UserCharacter, CharacterClass, Buff } from '../types';
import { DataService } from '../services/DataService';

interface AppState {
    isLoading: boolean;
    classes: CharacterClass[];
    buffs: Buff[];
    userCharacter: UserCharacter;
    activeBuffIds: string[];
    buffValues: Record<string, number>;
    selectedDungeonId: string | null;
}

interface AppContextType extends AppState {
    updateCharacterAttributes: (attrs: CharacterAttributes) => void;
    updateCharacterClass: (classId: string, faction: 'XIAN' | 'FO' | 'MO') => void;
    toggleBuff: (buffId: string) => void;
    updateBuffValue: (buffId: string, value: number) => void;
    selectDungeon: (dungeonId: string) => void;
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
    ClassID: 'QING_YUN',
    Faction: 'XIAN',
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

    useEffect(() => {
        const initData = async () => {
            const service = DataService.getInstance();
            await service.loadAllData();
            const loadedBuffs = service.getBuffs();
            setClasses(service.getClasses());
            setBuffs(loadedBuffs);

            // Set default buffs if empty
            if (activeBuffIds.length === 0) {
                const defaults = loadedBuffs.filter(b => b.IsDefaultActive).map(b => b.BuffID);
                setActiveBuffIds(defaults);
            }

            // Initialize buff values if empty
            if (Object.keys(buffValues).length === 0) {
                const initialValues: Record<string, number> = {};
                loadedBuffs.forEach(b => {
                    initialValues[b.BuffID] = b.DefaultEffectValue ?? 0;
                });
                setBuffValues(initialValues);
            }

            setIsLoading(false);
        };
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
            updateCharacterAttributes,
            updateCharacterClass,
            toggleBuff,
            updateBuffValue,
            selectDungeon
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
