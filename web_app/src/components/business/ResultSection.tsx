import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDungeonPower, calculateTotalPower } from '../../utils/calculator';
import { Trophy, Sparkles, Copy } from 'lucide-react';
import clsx from 'clsx';
import { DungeonDetail } from './DungeonDetail';

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
        const rankConfigs = DataService.getInstance().getRankConfigs();
        if (!rankConfigs || rankConfigs.length === 0) {
            return {
                Rank: 'C',
                Threshold: 0,
                Color: 'bg-slate-500/10',
                Shadow: 'shadow-none',
                Border: 'border-slate-500',
                TextColor: 'text-slate-400',
                Glow: ''
            };
        }
        return rankConfigs.find(c => power >= c.Threshold) || rankConfigs[rankConfigs.length - 1];
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

    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        setIsDragging(true);
        setDragOffset(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - touchStartX.current;
        const deltaY = currentY - touchStartY.current;

        // Locking direction: if vertical scroll is dominant, stop tracking drag
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 10) {
            setIsDragging(false);
            return;
        }

        // If we are dragging horizontally
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            setDragOffset(deltaX);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        const threshold = 100; // px to trigger switch

        if (Math.abs(dragOffset) > threshold) {
            const currentIndex = results.dungeonPowers.findIndex(d => d.DungeonID === selectedDungeonId);
            if (dragOffset > 0 && currentIndex > 0) {
                // Swipe Right -> Prev
                setSelectedDungeonId(results.dungeonPowers[currentIndex - 1].DungeonID);
            } else if (dragOffset < 0 && currentIndex < results.dungeonPowers.length - 1) {
                // Swipe Left -> Next
                setSelectedDungeonId(results.dungeonPowers[currentIndex + 1].DungeonID);
            }
        }

        setDragOffset(0);
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
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 self-start">
                    <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
                    副本战力分析
                </h2>

                <div
                    ref={containerRef}
                    className="relative w-full h-[650px] flex items-start justify-center perspective-1000 touch-pan-y overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Cards Container */}
                    <div className="relative w-full h-full flex items-start justify-center transform-style-3d">
                        {results.dungeonPowers.map((d, index) => {
                            const activeIndex = results.dungeonPowers.findIndex(dp => dp.DungeonID === selectedDungeonId);
                            const baseOffset = index - activeIndex;

                            // Calculate effective offset including drag
                            // Assume card width ~350px for drag sensitivity
                            const dragInfluence = dragOffset / 350;
                            const effectiveOffset = baseOffset + dragInfluence;

                            const absOffset = Math.abs(effectiveOffset);
                            const direction = Math.sign(effectiveOffset) || (baseOffset > 0 ? 1 : -1);

                            const rankConfig = getRankConfig(d.TotalDamage);
                            const powerRaw = d.TotalDamage;

                            // Continuous Transform Logic
                            // X Position: 0 -> 60% -> +15% per step
                            const xPercent = direction * (60 * Math.min(1, absOffset) + Math.max(0, absOffset - 1) * 15);

                            // Z Position: 0 -> -150 -> -50 per step
                            const translateZ = -150 * Math.min(1, absOffset) - (Math.max(0, absOffset - 1) * 50);

                            // Rotation: 0 -> -15 deg
                            const rotateY = -15 * Math.min(1, absOffset) * direction;

                            // Scale: 1 -> 0.8 -> -0.05 per step
                            const scale = 1 - 0.2 * Math.min(1, absOffset) - 0.05 * Math.max(0, absOffset - 1);

                            // Opacity: 1 -> 0.85 -> -0.15 per step
                            const opacity = Math.max(0, 1 - 0.15 * absOffset);

                            const isActive = d.DungeonID === selectedDungeonId;

                            return (
                                <div
                                    key={d.DungeonID}
                                    onClick={() => !isDragging && setSelectedDungeonId(d.DungeonID)}
                                    className={clsx(
                                        "absolute ease-out cursor-pointer origin-top",
                                        isActive ? "z-50 w-full md:w-[90%] max-w-5xl h-auto" : "w-[85%] md:w-[80%] h-auto"
                                    )}
                                    style={{
                                        transform: `translateX(${xPercent}%) scale(${scale}) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                                        zIndex: 50 - Math.round(absOffset),
                                        opacity: opacity,
                                        willChange: 'transform',
                                        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
                                    }}
                                >
                                    <DungeonDetail
                                        dungeon={d}
                                        isExpanded={isActive}
                                        standalone={true}
                                        rankConfig={rankConfig}
                                        power={powerRaw}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div >
    );
};
