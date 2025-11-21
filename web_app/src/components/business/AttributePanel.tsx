import React from 'react';
import type { CharacterAttributes } from '../../types';
import { AttributeCard } from '../ui/AttributeCard';
import { Card } from '../ui/Card';
import { AttributeRadarChart } from './AttributeRadarChart';
import { BuffSelector } from './BuffSelector';
import { ClassSelector } from './ClassSelector';
import { FactionSelector } from './FactionSelector';
import { Shield, Sword, Heart, Zap, Crosshair, Skull } from 'lucide-react';

interface AttributePanelProps {
    attributes: CharacterAttributes;
    onChange: (attrs: CharacterAttributes) => void;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ attributes, onChange }) => {
    const handleChange = (key: keyof CharacterAttributes, value: number) => {
        onChange({
            ...attributes,
            [key]: value
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Class Selector */}
            <ClassSelector />

            {/* Faction Selector */}
            <FactionSelector />

            {/* Character Attributes Grid */}
            <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full"></span>
                    角色属性
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <AttributeCard
                        label="最小攻击"
                        value={attributes.CharacterMinAttack}
                        onChange={(v) => handleChange('CharacterMinAttack', v)}
                        max={750000}
                        icon={<Sword className="w-4 h-4" />}
                        color="cyan"
                    />
                    <AttributeCard
                        label="最大攻击"
                        value={attributes.CharacterMaxAttack}
                        onChange={(v) => handleChange('CharacterMaxAttack', v)}
                        max={750000}
                        icon={<Sword className="w-4 h-4" />}
                        color="purple"
                    />
                    <AttributeCard
                        label="气血"
                        value={attributes.CharacterHealth}
                        onChange={(v) => handleChange('CharacterHealth', v)}
                        max={6000000}
                        step={100}
                        icon={<Heart className="w-4 h-4" />}
                        color="red"
                    />
                    <AttributeCard
                        label="真气"
                        value={attributes.CharacterMana}
                        onChange={(v) => handleChange('CharacterMana', v)}
                        max={6000000}
                        step={100}
                        icon={<Zap className="w-4 h-4" />}
                        color="blue"
                    />
                    <AttributeCard
                        label="防御"
                        value={attributes.CharacterDefense}
                        onChange={(v) => handleChange('CharacterDefense', v)}
                        max={500000}
                        icon={<Shield className="w-4 h-4" />}
                        color="emerald"
                    />
                    <AttributeCard
                        label="暴击伤害 (%)"
                        value={attributes.CharacterCriticalHitDamagePercent}
                        onChange={(v) => handleChange('CharacterCriticalHitDamagePercent', v)}
                        max={3000}
                        icon={<Crosshair className="w-4 h-4" />}
                        color="yellow"
                    />
                    <AttributeCard
                        label="对怪增伤 (%)"
                        value={attributes.CharacterMonsterDamageIncreasePercent}
                        onChange={(v) => handleChange('CharacterMonsterDamageIncreasePercent', v)}
                        max={60}
                        icon={<Skull className="w-4 h-4" />}
                        color="orange"
                    />
                </div>
            </div>

            {/* Buff Selector */}
            <BuffSelector />

            {/* Radar Chart Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
                    修炼星盘
                </h2>
                <div className="glass-panel p-4 bg-slate-800/50 flex items-center justify-center">
                    <AttributeRadarChart attributes={attributes} />
                </div>
            </div>

            {/* Formula Description */}
            {/* <Card title="计算公式说明" className="bg-slate-800/50">
                <div className="text-sm text-slate-400 space-y-2">
                    <div>
                        <strong className="text-cyan-400">基础伤害：</strong>
                        (角色攻击 × (1 + 技能攻击百分比)) + 技能攻击固定值 + (气血/真气/防御 × 技能对应百分比)
                    </div>
                    <div>
                        <strong className="text-purple-400">最终伤害：</strong>
                        基础伤害 × 暴伤增益 × 对怪增益 × 伤害增加增益 × 专注增益 × 怪物受到伤害增益 × 巫咒增益
                    </div>
                    <div>
                        <strong className="text-yellow-400">战力评分：</strong>
                        Σ(技能平均伤害 × 权重) → 副本平均 → 加权总分
                    </div>
                </div>
            </Card> */}

            {/* Buff Explanation */}
            {/* <Card title="增益说明" className="bg-slate-800/50">
                <div className="text-sm text-slate-400 space-y-3">
                    <div>
                        <strong className="text-pink-400">专注增益：</strong>
                        <p className="mt-1 ml-4">提升角色专注值，影响整体输出能力。数值越高，技能伤害加成越明显。</p>
                    </div>
                    <div>
                        <strong className="text-pink-400">巫咒增益：</strong>
                        <p className="mt-1 ml-4">增加巫咒效果百分比，对特定技能有额外加成。仙系职业收益更高。</p>
                    </div>
                    <div>
                        <strong className="text-pink-400">绿点增益：</strong>
                        <p className="mt-1 ml-4">提升对怪物的暴击伤害百分比。此增益对高暴伤属性角色效果显著。</p>
                    </div>
                    <div>
                        <strong className="text-pink-400">怪物受到伤害：</strong>
                        <p className="mt-1 ml-4">增加怪物受到的伤害百分比。此为全局增益，对所有技能都有效。</p>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500">
                            💡 提示：增益效果会乘法叠加，建议优先激活高收益增益。不同职业和阵营对增益的收益可能不同。
                        </p>
                    </div>
                </div>
            </Card> */}

            {/* Dungeon Data Explanation */}
            <Card title="使用说明" className="bg-slate-800/50">
                <div className="text-sm text-slate-400 space-y-3">
                    <div>
                        <strong className="text-cyan-400">副本战力计算：</strong>
                        <p className="mt-1 ml-4">基于当前角色属性、技能配置和增益状态，计算对各副本怪物的平均输出能力。</p>
                    </div>
                    <div>
                        <strong className="text-purple-400">战力评分：</strong>
                        {/* <p className="mt-1 ml-4">不同副本的怪物有不同的暴击伤害减免。高级副本怪物减免更高，需要更高的属性才能打出有效伤害。</p> */}
                        <p className="mt-1 ml-4">Σ(技能平均伤害 × 权重) → 副本平均 → 加权总分。</p>
                    </div>
                    <div>
                        <strong className="text-yellow-400">技能权重：</strong>
                        <p className="mt-1 ml-4">每个技能有不同的重要性权重，反映该技能在实战中的使用频率和战略价值。高权重技能对总战力影响更大。</p>
                    </div>
                    <div>
                        <strong className="text-green-400">综合评分：</strong>
                        <p className="mt-1 ml-4">综合战力是所有副本战力的加权平均值。</p>
                        {/* 评级标准：SSS(50万+) &gt; SS(30万+) &gt; S(10万+) &gt; A(5万+) &gt; B(1万+) &gt; C */}
                    </div>
                    <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500">
                            💡 提示：点击副本卡片可展开查看每个怪物和技能的详细伤害数据。数值采用等比字体便于对比。
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
