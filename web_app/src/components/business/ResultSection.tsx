import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDungeonPower, calculateTotalPower } from '../../utils/calculator';
import { Trophy, Copy, Sparkles, Swords } from 'lucide-react';
import { DungeonDetail } from './DungeonDetail';
import clsx from 'clsx';

// Define rank config directly in code to ensure Tailwind classes are generated
const RANK_CONFIGS = [
    {
        Rank: 'SSS',
        MinPower: 500000000,
        Color: 'bg-yellow-500/10',
        Shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]',
        Border: 'border-yellow-400',
        TextColor: 'text-yellow-400',
        Glow: 'animate-pulse-glow'
    },
    {
        Rank: 'SS',
        MinPower: 100000000,
        Color: 'bg-purple-500/10',
        Shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
        Border: 'border-purple-500',
        TextColor: 'text-purple-400',
        Glow: ''
    },
    {
        Rank: 'S',
        MinPower: 10000000,
        Color: 'bg-red-500/10',
        Shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        Border: 'border-red-500',
        TextColor: 'text-red-400',
        Glow: ''
    },
    {
        Rank: 'A',
        MinPower: 1000000,
        Color: 'bg-cyan-500/10',
        Shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        Border: 'border-cyan-400',
        TextColor: 'text-cyan-400',
        Glow: ''
    },
    {
        Rank: 'B',
        MinPower: 100000,
        Color: 'bg-emerald-500/10',
        Shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.4)]',
        Border: 'border-emerald-400',
        TextColor: 'text-emerald-400',
        Glow: ''
    },
    {
        Rank: 'C',
        MinPower: 0,
        Color: 'bg-slate-500/10',
        Shadow: 'shadow-none',
        Border: 'border-slate-500',
        TextColor: 'text-slate-400',
        Glow: ''
    }
];

export const ResultSection: React.FC = () => {
    const { userCharacter, activeBuffIds, buffs, buffValues } = useApp();
    const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(null);

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

    // Initialize selected dungeon
    useEffect(() => {
        if (!selectedDungeonId && results.dungeonPowers.length > 0) {
            setSelectedDungeonId(results.dungeonPowers[0].DungeonID);
        }
    }, [results.dungeonPowers, selectedDungeonId]);

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

    const selectedDungeon = results.dungeonPowers.find(d => d.DungeonID === selectedDungeonId);

    return (
        <div className="flex flex-col gap-6">
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

            {/* Dungeon Navigator Carousel (3D Coverflow) */}
            <div className="relative w-full flex flex-col items-center gap-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 px-1 self-start">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></span>
                    副本战力分析
                </h3>

                <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden perspective-1000">
                    {/* Cards Container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {results.dungeonPowers.map((d, index) => {
                            const activeIndex = results.dungeonPowers.findIndex(item => item.DungeonID === selectedDungeonId);
                            const offset = index - activeIndex;
                            const absOffset = Math.abs(offset);

                            // Only render visible cards to improve performance and look
                            if (absOffset > 3) return null;

                            const rank = getRankConfig(d.power);
                            const isSelected = offset === 0;

                            return (
                                <div
                                    key={d.DungeonID}
                                    onClick={() => setSelectedDungeonId(d.DungeonID)}
                                    className={clsx(
                                        "absolute w-64 md:w-72 p-5 rounded-2xl border transition-all duration-500 ease-out cursor-pointer shadow-2xl flex flex-col justify-between gap-4",
                                        isSelected
                                            ? "bg-slate-800 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                                            : "bg-slate-900/95 border-slate-700 hover:border-slate-600"
                                    )}
                                    style={{
                                        transform: `translateX(${offset * 60}%) scale(${1 - absOffset * 0.1})`,
                                        zIndex: 50 - absOffset,
                                        opacity: isSelected ? 1 : Math.max(0.3, 1 - absOffset * 0.3),
                                        filter: isSelected ? 'none' : `blur(${absOffset * 1}px) brightness(${1 - absOffset * 0.15})`
                                    }}
                                >
                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-gradient-x"></div>
                                    )}

                                    <div className="flex justify-between items-start">
                                        <span className={clsx(
                                            "text-xs font-black px-2 py-1 rounded-lg border backdrop-blur-md",
                                            rank.TextColor,
                                            rank.Border,
                                            "bg-slate-950/50"
                                        )}>
                                            {rank.Rank}
                                        </span>
                                        {isSelected && <Swords className="w-5 h-5 text-cyan-400 animate-pulse" />}
                                    </div>

                                    <div className="mt-2">
                                        <h4 className={clsx(
                                            "font-bold text-lg line-clamp-2 whitespace-normal leading-snug transition-colors min-h-[3.5rem]",
                                            isSelected ? "text-white" : "text-slate-400"
                                        )}>
                                            {d.DungeonName}
                                        </h4>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className={clsx(
                                                "font-black text-2xl tracking-tight",
                                                isSelected ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300" : "text-slate-500"
                                            )}>
                                                {formatDamage(d.power, false)}
                                            </span>
                                            <span className="text-xs font-bold text-slate-600">万</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Dungeon Detail View */}
            {selectedDungeon && (
                <div className="animate-fade-in">
                    <DungeonDetail
                        dungeon={selectedDungeon}
                        isExpanded={true}
                        onToggle={() => { }}
                    />
                </div>
            )}
        </div>
    );
};
