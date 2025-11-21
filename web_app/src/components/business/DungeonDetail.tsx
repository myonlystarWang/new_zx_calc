import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDamage } from '../../utils/calculator';
import type { Dungeon } from '../../types';
import { Sword } from 'lucide-react';
import clsx from 'clsx';

interface DungeonDetailProps {
    dungeon: Dungeon;
    isExpanded?: boolean;
    onToggle?: () => void;
    standalone?: boolean;
    rankConfig?: {
        Rank: string;
        Color: string;
        Shadow: string;
        Border: string;
        TextColor: string;
        Glow: string;
    };
    power?: number;
}

export const DungeonDetail: React.FC<DungeonDetailProps> = ({
    dungeon,
    isExpanded = false,
    onToggle,
    standalone = false,
    rankConfig,
    power
}) => {
    const { userCharacter, activeBuffIds, buffs, buffValues } = useApp();
    const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);

    // Reset selected monster when dungeon changes
    useEffect(() => {
        if (dungeon.Monsters.length > 0) {
            setSelectedMonsterId(dungeon.Monsters[0].MonsterID);
        }
    }, [dungeon.DungeonID]);

    const service = DataService.getInstance();
    const skillsMap = service.getSkills(userCharacter.ClassID);
    const skills = skillsMap ? skillsMap[userCharacter.Faction] || [] : [];
    const activeBuffs = buffs.filter(b => activeBuffIds.includes(b.BuffID));

    const formatDamage = (damage: number, withUnit: boolean = true): string => {
        if (damage >= 100000000) {
            const value = (damage / 100000000).toFixed(2);
            return withUnit ? `${value} 亿` : value;
        }
        if (damage >= 10000) {
            const value = (damage / 10000).toFixed(2);
            return withUnit ? `${value} 万` : value;
        }
        return Math.round(damage).toString();
    };

    const numberToChinese = (num: number): string => {
        const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        return chineseNumbers[num] || num.toString();
    };

    const showContent = standalone || isExpanded;
    const selectedMonster = dungeon.Monsters.find(m => m.MonsterID === selectedMonsterId) || dungeon.Monsters[0];

    // Pre-calculate damages for the selected monster
    const skillDamages = selectedMonster ? skills.map(skill => {
        const dmg = calculateDamage(userCharacter.BaseAttributes, skill, selectedMonster, activeBuffs, buffValues);
        return { skill, dmg };
    }).sort((a, b) => b.skill.SkillImportanceWeight - a.skill.SkillImportanceWeight) : [];

    const maxAvgDamage = skillDamages.length > 0 ? Math.max(...skillDamages.map(s => s.dmg.avgFinalDamage)) : 0;

    return (
        <div className={clsx(
            "glass-panel overflow-hidden transition-all duration-300",
            standalone ? 'h-full flex flex-col' : ''
        )}>
            {/* Header - Optimized Layout */}
            <div
                onClick={standalone ? undefined : onToggle}
                className={clsx(
                    "p-4 transition-colors group relative overflow-hidden",
                    standalone ? 'cursor-default bg-slate-800/50' : 'cursor-pointer hover:bg-slate-800/30'
                )}
            >
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {rankConfig && (
                                <span className={clsx(
                                    "text-xs font-black px-2 py-1 rounded-lg border backdrop-blur-md shadow-sm",
                                    rankConfig.TextColor,
                                    rankConfig.Border,
                                    "bg-slate-950/50"
                                )}>
                                    {rankConfig.Rank}
                                </span>
                            )}
                            <span className={clsx(
                                "font-bold text-lg md:text-xl text-slate-100 transition-colors tracking-wide",
                                !standalone && 'group-hover:text-cyan-300'
                            )}>
                                {dungeon.DungeonName}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] md:text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                {dungeon.Monsters.length} BOSS
                            </span>
                            {standalone && <Sword className="w-4 h-4 text-cyan-500/50" />}
                        </div>
                    </div>

                    {power !== undefined && (
                        <div className="flex items-baseline gap-1">
                            <span className={clsx(
                                "font-black text-2xl md:text-3xl tracking-tight",
                                "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300"
                            )}>
                                {formatDamage(power, false)}
                            </span>
                            <span className="text-xs font-bold text-slate-600">万</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {showContent && (
                <div className={clsx(
                    "border-t border-slate-700/50 bg-slate-900/30 flex flex-col",
                    standalone ? 'flex-1 overflow-hidden' : ''
                )}>
                    {/* Boss Tabs Navigation - Clean Scrollable List */}
                    <div className="flex items-center gap-1 md:gap-2 px-2 py-2 border-b border-slate-700/30 bg-slate-900/50">
                        <div className="flex-1 flex overflow-x-auto gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {dungeon.Monsters.map((monster) => {
                                const isSelected = monster.MonsterID === selectedMonsterId;
                                return (
                                    <button
                                        key={monster.MonsterID}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMonsterId(monster.MonsterID);
                                        }}
                                        className={clsx(
                                            "flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 whitespace-nowrap",
                                            isSelected
                                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                                        )}
                                    >
                                        {isSelected && <Sword className="w-3 h-3" />}
                                        <span>第{numberToChinese(monster.DungeonLevel)}关</span>
                                        <span className={clsx(
                                            "ml-1 opacity-75",
                                            isSelected ? "text-cyan-200" : "text-slate-500"
                                        )}>
                                            {monster.MonsterName}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Boss Data */}
                    {selectedMonster && (
                        <div className={clsx(
                            "animate-fade-in",
                            standalone ? 'flex-1 overflow-y-auto' : ''
                        )}>
                            <div className="p-3 md:p-4">
                                {/* Skills Damage Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-700/50">
                                                <th className="text-left py-2 px-2 text-slate-400 font-medium text-xs whitespace-nowrap w-1/3">技能</th>
                                                <th className="text-right py-2 px-2 text-slate-400 font-medium text-xs whitespace-nowrap">最小伤害</th>
                                                <th className="text-right py-2 px-2 text-slate-400 font-medium text-xs whitespace-nowrap">最大伤害</th>
                                                <th className="text-right py-2 px-2 text-slate-400 font-medium text-xs whitespace-nowrap w-1/3">平均伤害</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/30">
                                            {skillDamages.map(({ skill, dmg }) => {
                                                const barWidth = maxAvgDamage > 0 ? (dmg.avgFinalDamage / maxAvgDamage) * 100 : 0;

                                                return (
                                                    <tr key={skill.SkillID} className="hover:bg-slate-800/30 transition-colors group relative">
                                                        <td className="py-3 px-2 text-slate-200 font-medium relative z-10 whitespace-nowrap">
                                                            {skill.SkillName}
                                                        </td>
                                                        <td className="py-3 px-2 text-right text-cyan-300 font-mono text-sm font-medium relative z-10 whitespace-nowrap">
                                                            {formatDamage(dmg.minFinalDamage)}
                                                        </td>
                                                        <td className="py-3 px-2 text-right text-purple-300 font-mono text-sm font-medium relative z-10 whitespace-nowrap">
                                                            {formatDamage(dmg.maxFinalDamage)}
                                                        </td>
                                                        <td className="py-3 px-2 text-right relative">
                                                            {/* Damage Bar Background */}
                                                            <div
                                                                className="absolute inset-y-1 right-1 bg-yellow-500/10 rounded-sm transition-all duration-500"
                                                                style={{ width: `${barWidth * 0.95}%` }}
                                                            />
                                                            <span className="relative z-10 text-yellow-300 font-mono font-bold text-sm md:text-base shadow-black drop-shadow-sm whitespace-nowrap">
                                                                {formatDamage(dmg.avgFinalDamage)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
