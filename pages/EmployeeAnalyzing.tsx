import React from 'react';
import { Brain } from 'lucide-react';

export const EmployeeAnalyzing = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
            <div className="relative mb-12">
                <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full" />
                <div className="w-32 h-32 border-8 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin" />
                <div className={`absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-current border-l-current rounded-full animate-spin direction-reverse ${isDarkMode ? 'text-white/20' : 'text-slate-900/10'} `} />

                <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="animate-pulse text-blue-500" size={40} />
                </div>
            </div>

            <h2 className="text-4xl font-black mb-4 tracking-tighter">Analyzing</h2>
            <p className={`${textMuted} font-light text-xl`}>Connecting neural pathways...</p>
        </div>
    );
};
