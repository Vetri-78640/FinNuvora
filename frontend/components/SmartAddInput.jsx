'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function SmartAddInput({ onAdd, disabled }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setLoading(true);
        try {
            await onAdd(text);
            setText('');
        } catch (error) {
            // Error handling is done by the parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#0E1324] rounded-full border border-slate-800 p-1.5">
                <div className="pl-3 pr-2 text-yellow-400">
                    <Sparkles size={18} />
                </div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ask AI: 'Bought 10 AAPL at 150'..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm py-2"
                    disabled={disabled || loading}
                />
                <button
                    type="submit"
                    disabled={disabled || loading || !text.trim()}
                    className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
            </form>
            <p className="text-xs text-slate-500 mt-2 pl-1">
                Try: "Bought 15 NVDA at 850" or "Added 50 shares of MSFT"
            </p>
        </div>
    );
}
