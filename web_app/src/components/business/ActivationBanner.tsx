import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ShieldCheck, Gamepad2, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export const ActivationBanner: React.FC = () => {
    const { vipStatus, vipCode, activateVip } = useApp();
    const [inputCode, setInputCode] = useState(vipCode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleActivate = async () => {
        if (!inputCode.trim()) return;

        setIsSubmitting(true);
        setMessage(null);

        const success = await activateVip(inputCode);

        if (success) {
            setMessage({ type: 'success', text: '高级版已成功激活！' });
        } else {
            setMessage({ type: 'error', text: '无效的卡密，请检查后重试。' });
        }

        setIsSubmitting(false);
        // 清除成功消息
        if (success) {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (vipStatus === 'premium') {
        return (
            <div className="glass-panel px-4 py-2 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-500/20">
                        <ShieldCheck className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-yellow-200">高级版已激活</span>
                        <p className="text-[10px] text-yellow-500/70 font-medium">尊享全量职业与顶级副本数据</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                    <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-400">{vipCode.slice(0, 4)}****</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className={clsx(
                "glass-panel p-3 flex flex-col md:flex-row items-center gap-4 border-dashed",
                vipStatus === 'invalid' ? "border-red-500/30 bg-red-500/5" : "border-slate-700/50 bg-slate-800/40"
            )}>
                <div className="flex items-center gap-3 flex-1">
                    <div className={clsx(
                        "p-2 rounded-xl",
                        vipStatus === 'invalid' ? "bg-red-500/10" : "bg-slate-700/30"
                    )}>
                        {vipStatus === 'invalid' ? (
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                        ) : (
                            <Gamepad2 className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-200">
                            {vipStatus === 'invalid' ? "验证失败" : "激活高级版数据"}
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-tight">
                            输入激活码解锁T21、更多副本及职业核心计算数值
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="输入激活码..."
                        className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 flex-1 md:w-40 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                    />
                    <button
                        onClick={handleActivate}
                        disabled={isSubmitting || !inputCode.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                    >
                        {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "激活"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={clsx(
                    "px-3 py-1.5 rounded-lg text-[10px] font-medium border animate-in slide-in-from-top-2",
                    message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    {message.text}
                </div>
            )}
        </div>
    );
};
