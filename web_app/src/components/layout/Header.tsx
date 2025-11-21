import React from 'react';
import { Calculator } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="w-full py-4 md:py-6 mb-6 md:mb-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-[100] shadow-lg shadow-slate-900/50">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
                        <Calculator className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gradient tracking-tight">
                            诛仙3战力计算器
                        </h1>
                        <p className="text-xs text-slate-400 font-mono tracking-wider">
                            V 2.0.1 | by 星耀-萝卜
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* <span className="px-2 md:px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                        诛仙3
                    </span> */}
                </div>
            </div>
        </header>
    );
};
