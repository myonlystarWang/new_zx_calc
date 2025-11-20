import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Info } from 'lucide-react';
import clsx from 'clsx';

export const BuffSelector: React.FC = () => {
    const { buffs, activeBuffIds, toggleBuff, buffValues, updateBuffValue } = useApp();

    // Filter buffs: only show if IsDefaultActive or IsEditable is true (or if it's not explicitly false)
    // The requirement says: "IsDefaultActive and IsEditable为false的参数不显示"
    // So we filter out buffs where IsDefaultActive === false AND IsEditable === false
    const visibleBuffs = buffs.filter(buff => !(buff.IsDefaultActive === false && buff.IsEditable === false));

    const formatBuffEffect = (buff: any, value: number) => {
        const effects: string[] = [];
        const buffEffects = buff.BuffEffects || {};

        // Use the dynamic value for the effect description
        if (buffEffects.BuffFocusPercentEffect) {
            effects.push(`专注 +${value}`);
        }
        if (buffEffects.BuffHolyWrathPercentEffect) {
            effects.push(`巫咒 +${value}%`);
        }
        if (buffEffects.BuffMonsterCriticalDamagePercentEffect) {
            effects.push(`对怪暴伤 +${value}`);
        }
        if (buffEffects.BuffMonsterHarmedPercentEffect) {
            effects.push(`怪物受伤 +${value}%`);
        }
        if (buffEffects.BuffAttackPercentEffect) {
            effects.push(`攻击 +${value}%`);
        }

        return effects.length > 0 ? effects.join(', ') : buff.BuffName;
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, buffId: string) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            updateBuffValue(buffId, val);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></span>
                战斗增益
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleBuffs.map((buff) => {
                    const isActive = activeBuffIds.includes(buff.BuffID);
                    const currentValue = buffValues[buff.BuffID] ?? buff.DefaultEffectValue ?? 0;
                    const isFocusBuff = buff.BuffName.includes('专注');

                    return (
                        <div
                            key={buff.BuffID}
                            className={clsx(
                                'glass-panel p-5 transition-all duration-300 hover:border-pink-500/50',
                                isActive
                                    ? 'border-pink-500/70 bg-pink-500/10'
                                    : 'border-slate-700'
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleBuff(buff.BuffID)}>
                                    <div className={clsx(
                                        'p-2 rounded-lg transition-all',
                                        isActive
                                            ? 'bg-pink-500/20 text-pink-400'
                                            : 'bg-slate-800/50 text-slate-400'
                                    )}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className={clsx(
                                        'font-semibold',
                                        isActive ? 'text-pink-300' : 'text-slate-300'
                                    )}>
                                        {buff.BuffName}
                                    </span>
                                    {isFocusBuff && (
                                        <div className="group relative ml-2">
                                            <Info className="w-4 h-4 text-slate-500 hover:text-pink-400 cursor-help" />
                                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-slate-900/95 border border-slate-700 rounded-lg text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                <div className="font-bold text-pink-400 mb-1">专注值参考：</div>
                                                <ul className="space-y-1">
                                                    <li>三碗专注：20</li>
                                                    <li>天音专注：18+2</li>
                                                    <li>天华专注：40+2+18+2</li>
                                                    <li>焚香专注：30</li>
                                                    <li>画影专注：24+3+X (每40万真气+1)</li>
                                                    <li>挂件专注：52.5+7.5 (需132万真气)</li>
                                                    <li>逐霜专注：79/49 (仙/魔佛)</li>
                                                    <li>归云专注：90/30 (魔/仙佛)</li>
                                                    <li>青云专注：50/30 (仙/魔佛)</li>
                                                    <li>涅羽专注：70+X (每10万真气+1)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Checkbox */}
                                <div
                                    onClick={() => toggleBuff(buff.BuffID)}
                                    className={clsx(
                                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer',
                                        isActive
                                            ? 'bg-pink-500 border-pink-500'
                                            : 'border-slate-600'
                                    )}>
                                    {isActive && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-slate-400 leading-relaxed flex-grow">
                                    {formatBuffEffect(buff, currentValue)}
                                </p>
                                {buff.IsEditable && isActive && (
                                    <input
                                        type="number"
                                        value={currentValue}
                                        onChange={(e) => handleValueChange(e, buff.BuffID)}
                                        className="w-20 bg-slate-900/50 border border-slate-600 rounded px-2 py-1 text-right text-sm text-pink-300 focus:outline-none focus:border-pink-500 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
