import React from 'react';
import { useApp } from '../../context/AppContext';
import { User } from 'lucide-react';
import clsx from 'clsx';

export const ClassSelector: React.FC = () => {
    const { classes, userCharacter, updateCharacterClass } = useApp();

    return (
        <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                职业选择
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {classes.map((cls) => {
                    const isActive = userCharacter.ClassID === cls.ClassID;

                    return (
                        <div
                            key={cls.ClassID}
                            onClick={() => updateCharacterClass(cls.ClassID, userCharacter.Faction)}
                            className={clsx(
                                'glass-panel p-4 cursor-pointer transition-all duration-300 hover:border-blue-500/50 group relative overflow-hidden',
                                isActive
                                    ? 'border-blue-500/70 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                    : 'border-slate-700'
                            )}
                        >
                            <div className="flex flex-col items-center gap-2 text-center relative z-10">
                                <div className={clsx(
                                    'p-3 rounded-xl transition-all',
                                    isActive
                                        ? 'bg-blue-500/20 text-blue-400 scale-110 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                        : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50'
                                )}>
                                    <User className="w-5 h-5" />
                                </div>

                                <span className={clsx(
                                    'font-semibold text-sm',
                                    isActive ? 'text-blue-300' : 'text-slate-300'
                                )}>
                                    {cls.ClassName}
                                </span>
                            </div>

                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
