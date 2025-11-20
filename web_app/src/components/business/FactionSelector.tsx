import React from 'react';
import { useApp } from '../../context/AppContext';
import { Swords } from 'lucide-react';
import clsx from 'clsx';

const FACTIONS = [
    { id: 'XIAN', name: '仙', color: 'cyan' },
    { id: 'FO', name: '佛', color: 'yellow' },
    { id: 'MO', name: '魔', color: 'purple' }
] as const;

export const FactionSelector: React.FC = () => {
    const { userCharacter, updateCharacterClass } = useApp();

    return (
        <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                阵营选择
            </h2>

            <div className="grid grid-cols-3 gap-4">
                {FACTIONS.map((faction) => {
                    const isActive = userCharacter.Faction === faction.id;

                    const colorClasses = {
                        cyan: {
                            active: 'border-cyan-500/70 bg-cyan-500/10',
                            icon: 'bg-cyan-500/20 text-cyan-400',
                            text: 'text-cyan-300',
                            hover: 'hover:border-cyan-500/50'
                        },
                        yellow: {
                            active: 'border-yellow-500/70 bg-yellow-500/10',
                            icon: 'bg-yellow-500/20 text-yellow-400',
                            text: 'text-yellow-300',
                            hover: 'hover:border-yellow-500/50'
                        },
                        purple: {
                            active: 'border-purple-500/70 bg-purple-500/10',
                            icon: 'bg-purple-500/20 text-purple-400',
                            text: 'text-purple-300',
                            hover: 'hover:border-purple-500/50'
                        }
                    };

                    const colors = colorClasses[faction.color];

                    return (
                        <div
                            key={faction.id}
                            onClick={() => updateCharacterClass(userCharacter.ClassID, faction.id as any)}
                            className={clsx(
                                'glass-panel p-6 cursor-pointer transition-all duration-300 group',
                                isActive ? colors.active : `border-slate-700 ${colors.hover}`
                            )}
                        >
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className={clsx(
                                    'p-4 rounded-xl transition-all',
                                    isActive
                                        ? `${colors.icon} scale-110`
                                        : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50'
                                )}>
                                    <Swords className="w-6 h-6" />
                                </div>

                                <span className={clsx(
                                    'font-bold text-xl',
                                    isActive ? colors.text : 'text-slate-300'
                                )}>
                                    {faction.name}
                                </span>

                                {isActive && (
                                    <div className={`w-full h-1 bg-gradient-to-r from-transparent via-${faction.color}-500 to-transparent rounded-full`} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
