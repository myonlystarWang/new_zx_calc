import React from 'react';
import clsx from 'clsx';

interface SliderInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    icon?: React.ReactNode;
}

export const SliderInput: React.FC<SliderInputProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100000,
    step = 1,
    className,
    icon
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            onChange(val);
        }
    };

    return (
        <div className={clsx('flex flex-col gap-2', className)}>
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    {icon}
                    {label}
                </label>
                <input
                    type="number"
                    value={value}
                    onChange={handleChange}
                    className="w-24 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
        </div>
    );
};
