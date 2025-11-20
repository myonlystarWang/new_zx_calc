import React from 'react';
import clsx from 'clsx';

interface AttributeCardProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    icon: React.ReactNode;
    iconColor?: string;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100000,
    step = 1,
    icon,
    iconColor = 'text-cyan-400'
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= min && val <= max) {
            onChange(val);
        } else if (!isNaN(val) && val > max) {
            onChange(max);
        } else if (!isNaN(val) && val < min) {
            onChange(min);
        }
    };

    return (
        <div className="glass-panel p-4 flex flex-col gap-3 hover:border-cyan-500/30 transition-all duration-300 animate-fade-in group">
            {/* Header: Icon & Label Centered Row */}
            <div className="flex items-center justify-center gap-3">
                <div className={clsx('p-2 rounded-lg bg-slate-800/50 transition-transform group-hover:scale-110 shadow-sm shrink-0', iconColor)}>
                    {icon}
                </div>
                <span className="text-sm font-bold text-slate-300 tracking-wide whitespace-nowrap">{label}</span>
            </div>

            {/* Large Number Display */}
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                className="bg-transparent text-xl font-black text-white w-full text-center focus:outline-none focus:text-cyan-400 transition-colors py-1"
                style={{ fontVariantNumeric: 'tabular-nums' }}
            />

            {/* Slider */}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
        </div>
    );
};
