import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDungeonPower, calculateTotalPower } from '../../utils/calculator';
import { Trophy, Copy, Sparkles } from 'lucide-react';
import { DungeonDetail } from './DungeonDetail';
import clsx from 'clsx';

// Define rank config directly in code to ensure Tailwind classes are generated
const RANK_CONFIGS = [
    {
        Rank: 'SSS',
        MinPower: 500000000,
        Color: 'bg-yellow-500/5',
        Shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6),inset_0_0_10px_rgba(250,204,21,0.1)]',
        Border: 'border-2 border-yellow-400',
        TextColor: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]',
        Glow: 'animate-pulse-glow'
    },
    {
        Rank: 'SS',
        MinPower: 100000000,
        Color: 'bg-purple-500/5',
        Shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_0_10px_rgba(168,85,247,0.1)]',
        Border: 'border-2 border-purple-500',
        TextColor: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
        Glow: ''
    },
    {
        Rank: 'S',
        MinPower: 10000000,
        Color: 'bg-red-500/5',
        Shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.6),inset_0_0_10px_rgba(239,68,68,0.1)]',
        Border: 'border-2 border-red-500',
        TextColor: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]',
        Glow: ''
    },
    {
        Rank: 'A',
        MinPower: 1000000,
        Color: 'bg-cyan-500/5',
        Shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_10px_rgba(34,211,238,0.1)]',
        Border: 'border-2 border-cyan-400',
        TextColor: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
        Glow: ''
    },
    {
        Rank: 'B',
        MinPower: 100000,
        Color: 'bg-emerald-500/5',
        Shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.5),inset_0_0_5px_rgba(52,211,153,0.1)]',
        Border: 'border-2 border-emerald-400',
        TextColor: 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]',
        Glow: ''
    },
    {
        Rank: 'C',
        MinPower: 0,
        Color: 'bg-slate-500/5',
        Shadow: 'shadow-none',
        Border: 'border-2 border-slate-500',
        TextColor: 'text-slate-400',
        Glow: ''
    }
];

export const ResultSection: React.FC = () => {
    const { userCharacter, activeBuffIds, buffs, buffValues } = useApp();
    const [expandedDungeonIds, setExpandedDungeonIds] = useState<Set<string>>(new Set());

    const results = useMemo(() => {
        const service = DataService.getInstance();
        const skillsMap = service.getSkills(userCharacter.ClassID);
        const skills = skillsMap ? skillsMap[userCharacter.Faction] || [] : [];
        const dungeons = service.getDungeons();
        const activeBuffs = buffs.filter(b => activeBuffIds.includes(b.BuffID));

        const dungeonPowers = dungeons.map(dungeon => {
            const power = calculateDungeonPower(
                userCharacter.BaseAttributes,
                skills,
                dungeon.Monsters,
                activeBuffs,
                buffValues
            );
            return {
                ...dungeon,
                power
            };
        });

        const totalPower = calculateTotalPower(
            dungeonPowers.map(d => d.power),
            dungeonPowers.map(() => 1)
        );

        return {
            totalPower,
            dungeonPowers
        };
    }, [userCharacter, activeBuffIds, buffs, buffValues]);

    const getRankConfig = (power: number) => {
        return RANK_CONFIGS.find(c => power >= c.MinPower) || RANK_CONFIGS[RANK_CONFIGS.length - 1];
    };

    const formatDamage = (damage: number, withUnit: boolean = true): string => {
        if (damage >= 100000000) {
            const value = (damage / 100000000).toFixed(2);
            return withUnit ? `${value}亿` : value;
        }
        if (damage >= 10000) {
            const value = (damage / 10000).toFixed(2);
            return withUnit ? `${value}万` : value;
        }
        return Math.round(damage).toString();
    };

    const currentRankConfig = getRankConfig(results.totalPower);

    const copyData = () => {
        const text = `诛仙3战力: ${formatDamage(results.totalPower)} (${currentRankConfig.Rank}级)`;
        navigator.clipboard.writeText(text);
    };

    const toggleDungeon = (dungeonId: string) => {
        setExpandedDungeonIds(prev => {
            const next = new Set(prev);
            if (next.has(dungeonId)) {
                next.delete(dungeonId);
            } else {
                next.add(dungeonId);
            }
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Total Power Card - Compact & Fixed Styles */}
            <div className="glass-panel p-6 relative overflow-hidden bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-cyan-500/30">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-24 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative flex flex-col items-center text-center z-10">
                    {/* Header - Compact */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-white tracking-wide italic" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                综合战力评分
                            </h2>
                            <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase leading-none">Total Power Score</p>
                        </div>
                    </div>

                    {/* Main Power Number - Enhanced Gradient */}
                    <div className="relative mb-3">
                        <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-200 tracking-tighter drop-shadow-2xl"
                            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                            {Math.round(results.totalPower).toLocaleString()}
                        </div>
                    </div>

                    {/* Rank Badge - Dynamic Styles */}
                    <div className="mb-5">
                        <div className={clsx(
                            'px-6 py-1 rounded-full border backdrop-blur-md transition-all duration-500',
                            currentRankConfig.Color,
                            currentRankConfig.Shadow,
                            currentRankConfig.Border,
                            currentRankConfig.Glow
                        )}>
                            <span className={clsx(
                                'text-lg font-black italic tracking-wider',
                                currentRankConfig.TextColor
                            )} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                {currentRankConfig.Rank} 级
                            </span>
                        </div>
                    </div>

                    {/* Footer Actions - Compact */}
                    <div className="flex flex-col md:flex-row items-center gap-3 text-xs w-full justify-center border-t border-slate-700/50 pt-4">
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>基于 {results.dungeonPowers.length} 个副本评估</span>
                        </div>

                        <button
                            onClick={copyData}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-full text-cyan-300 transition-all group"
                        >
                            <Copy className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            <span>复制战力数据</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Dungeon Power List with Details */}
            <div className="animate-fade-in">
                <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></span>
                    副本战力详情
                </h3>
                <div className="grid grid-cols-1 gap-2">
                    {results.dungeonPowers.map((d, index) => (
                        <div
                            key={d.DungeonID}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <DungeonDetail
                                dungeon={d}
                                isExpanded={expandedDungeonIds.has(d.DungeonID)}
                                onToggle={() => toggleDungeon(d.DungeonID)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
