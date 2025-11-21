import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDungeonPower, calculateTotalPower } from '../../utils/calculator';
import { Trophy, Sparkles, Copy } from 'lucide-react';
import clsx from 'clsx';
import { DungeonDetail } from './DungeonDetail';

const RANK_CONFIGS = [
    {
        Rank: 'SSS',
        Threshold: 500000000, // 2000万
        Color: 'bg-yellow-500/10',
        Shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
        Border: 'border-yellow-400',
        TextColor: 'text-yellow-400',
        Glow: 'drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]'
    },
    {
        Rank: 'SS',
        Threshold: 100000000, // 1000万
        Color: 'bg-purple-500/10',
        Shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
        Border: 'border-purple-400',
        TextColor: 'text-purple-400',
        Glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]'
    },
    {
        Rank: 'S',
        Threshold: 10000000, // 500万
        Color: 'bg-blue-500/10',
        Shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
        Border: 'border-blue-400',
        TextColor: 'text-blue-400',
        Glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
    },
    {
        Rank: 'A',
        Threshold: 1000000,
        Color: 'bg-cyan-500/10',
        Shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]',
        Border: 'border-cyan-400',
        TextColor: 'text-cyan-400',
        Glow: ''
    },
    {
        Rank: 'B',
        Threshold: 100000,
        Color: 'bg-emerald-500/10',
        Shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.4)]',
        Border: 'border-emerald-400',
        TextColor: 'text-emerald-400',
        Glow: ''
    },
    {
        Rank: 'C',
        Threshold: 0,
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
                TotalDamage: power // Ensure TotalDamage is set for compatibility
            };
        });

        const totalPower = calculateTotalPower(
            dungeonPowers.map(d => d.TotalDamage),
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
        return RANK_CONFIGS.find(c => power >= c.Threshold) || RANK_CONFIGS[RANK_CONFIGS.length - 1];
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

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            const currentIndex = results.dungeonPowers.findIndex(d => d.DungeonID === selectedDungeonId);
            if (currentIndex < results.dungeonPowers.length - 1) {
                setSelectedDungeonId(results.dungeonPowers[currentIndex + 1].DungeonID);
            }
        }

        if (isRightSwipe) {
            const currentIndex = results.dungeonPowers.findIndex(d => d.DungeonID === selectedDungeonId);
            if (currentIndex > 0) {
                setSelectedDungeonId(results.dungeonPowers[currentIndex - 1].DungeonID);
            }
        }
    };

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
                        <div className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-200 tracking-tighter drop-shadow-2xl"
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

            {/* Dungeon Navigator Carousel (3D Stack) */}
            <div className="relative w-full flex flex-col items-center gap-4">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 px-1 self-start">
                    <span className="w-1 h-4 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></span>
                    副本战力分析
                </h3>

                <div
                    className="relative w-full h-[600px] flex items-center justify-center perspective-1000 touch-pan-y overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Cards Container */}
                    <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                        {results.dungeonPowers.map((d, index) => {
                            const isActive = d.DungeonID === selectedDungeonId;
                            const activeIndex = results.dungeonPowers.findIndex(dp => dp.DungeonID === selectedDungeonId);
                            const offset = index - activeIndex;
                            const absOffset = Math.abs(offset);
                            const direction = Math.sign(offset);

                            // Render all cards to ensure full list is visible
                            // if (absOffset > 3) return null;

                            const rankConfig = getRankConfig(d.TotalDamage);
                            const powerInWan = Math.round(d.TotalDamage / 10000);

                            // Split Stack Logic:
                            // - Active: Center (0)
                            // - Sides: Pushed out by 60% + stack spacing
                            // - This creates a "Gap" so the active card doesn't cover the immediate neighbors
                            let translateX = 0;
                            let translateZ = 0;
                            let rotateY = 0;
                            let scale = 1;
                            let opacity = 1;

                            if (isActive) {
                                translateX = 0;
                                translateZ = 0;
                                rotateY = 0;
                                scale = 1;
                                opacity = 1;
                            } else {
                                // Base gap of 60% (relative to card width) + 15% per extra card
                                const baseGap = 60;
                                const stackSpacing = 15;
                                const xPercent = direction * (baseGap + (absOffset - 1) * stackSpacing);

                                translateX = xPercent; // We'll use % in the style string
                                translateZ = -100 - (absOffset * 50); // Deepen the stack
                                rotateY = direction * -15; // Rotate inwards to face center
                                scale = 0.85 - (absOffset * 0.05);
                                opacity = Math.max(0.4, 1 - absOffset * 0.15);
                            }

                            return (
                                <div
                                    key={d.DungeonID}
                                    onClick={() => setSelectedDungeonId(d.DungeonID)}
                                    className={clsx(
                                        "absolute transition-all duration-500 ease-out cursor-pointer origin-center",
                                        isActive ? "z-50 w-full md:w-[90%] max-w-5xl h-full" : "w-[85%] md:w-[80%] h-[90%]"
                                    )}
                                    style={{
                                        transform: isActive
                                            ? `translateX(0) scale(1) translateZ(0) rotateY(0)`
                                            : `translateX(${translateX}%) scale(${scale}) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                                        zIndex: 50 - absOffset,
                                        opacity: opacity,
                                        filter: isActive ? 'none' : `blur(${absOffset * 1}px) brightness(${1 - absOffset * 0.1})`,
                                    }}
                                >
                                    <DungeonDetail
                                        dungeon={d}
                                        isExpanded={isActive}
                                        standalone={true}
                                        rankConfig={rankConfig}
                                        power={powerInWan}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
