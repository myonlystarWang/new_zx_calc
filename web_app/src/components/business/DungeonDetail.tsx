import React from 'react';
import { useApp } from '../../context/AppContext';
import { DataService } from '../../services/DataService';
import { calculateDamage } from '../../utils/calculator';
import type { Dungeon } from '../../types';
import { ChevronDown } from 'lucide-react';

interface DungeonDetailProps {
    dungeon: Dungeon;
    isExpanded: boolean;
    onToggle: () => void;
}

export const DungeonDetail: React.FC<DungeonDetailProps> = ({ dungeon, isExpanded, onToggle }) => {
    const { userCharacter, activeBuffIds, buffs, buffValues } = useApp();

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

    return (
        <div className="glass-panel overflow-hidden transition-all duration-300">
            {/* Header - Clickable */}
            <div
                onClick={onToggle}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{dungeon.DungeonName}</span>
                    <span className="text-xs text-slate-500">{dungeon.Monsters.length} 个boss</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm text-slate-400">副本战力</div>
                        <div className="font-bold text-cyan-400 text-lg">
                            {Math.round(
                                dungeon.Monsters.reduce((sum, monster) => {
                                    const monsterPower = skills.reduce((skillSum, skill) => {
                                        const dmg = calculateDamage(userCharacter.BaseAttributes, skill, monster, activeBuffs, buffValues);
                                        return skillSum + dmg.avgFinalDamage * skill.SkillImportanceWeight;
                                    }, 0);
                                    return sum + monsterPower;
                                }, 0) / dungeon.Monsters.length
                            ).toLocaleString()}
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} `}
                    />
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-slate-700/50 bg-slate-900/30">
                    {dungeon.Monsters.map((monster, monsterIndex) => (
                        <div key={monster.MonsterID} className="p-4 border-b border-slate-700/30 last:border-b-0">
                            {/* Monster Header */}
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {monster.MonsterName}
                                </h4>
                                <span className="text-xs text-slate-500">
                                    等级 {monster.DungeonLevel}
                                </span>
                            </div>

                            {/* Skills Damage Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="text-left py-2 px-3 text-slate-400 font-medium">技能名称</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">最小伤害</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">最大伤害</th>
                                            <th className="text-right py-2 px-3 text-slate-400 font-medium">平均伤害</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...skills]
                                            .sort((a, b) => b.SkillImportanceWeight - a.SkillImportanceWeight)
                                            .map((skill) => {
                                                const dmg = calculateDamage(userCharacter.BaseAttributes, skill, monster, activeBuffs, buffValues);
                                                return (
                                                    <tr key={skill.SkillID} className="border-b border-slate-700/30 hover:bg-slate-800/20">
                                                        <td className="py-2 px-3 text-slate-300">{skill.SkillName}</td>
                                                        <td className="py-2 px-3 text-right text-cyan-300 font-mono">
                                                            {formatDamage(dmg.minFinalDamage)}
                                                        </td>
                                                        <td className="py-2 px-3 text-right text-purple-300 font-mono">
                                                            {formatDamage(dmg.maxFinalDamage)}
                                                        </td>
                                                        <td className="py-2 px-3 text-right text-yellow-300 font-mono font-semibold">
                                                            {formatDamage(dmg.avgFinalDamage)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
