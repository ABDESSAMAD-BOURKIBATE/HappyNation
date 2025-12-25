import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button, Card, BriefcaseIcon } from '../components/Shared';

export const RoleSelection = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const headingGradient = isDarkMode
        ? 'bg-gradient-to-br from-white via-slate-200 to-slate-500'
        : 'bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500';

    return (
        <div className="flex flex-col min-h-[100dvh] p-4 relative z-10 pt-12 md:pt-4 md:justify-center">
            <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 md:grid md:grid-cols-2 gap-4 md:gap-10 pb-4 md:pb-12">
                <div className="flex-none col-span-2 flex flex-col items-center justify-center mb-2 md:mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className={`relative w-24 h-24 md:w-40 md:h-40 rounded-full border-4 flex items-center justify-center shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'} `}>
                            <img src="/logo.png" alt="Happynation Logo" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>

                    <h1 className={`text-4xl md:text-7xl font-black mt-6 md:mt-8 text-center bg-clip-text text-transparent ${headingGradient} tracking-tighter`}>
                        Happynation
                    </h1>
                    <p className={`${textMuted} mt-3 md:mt-4 text-base md:text-xl font-light text-center max-w-2xl px-4`}>
                        Happynation-Employee Well-Being AI Evaluation App
                    </p>
                </div>

                <Card isDark={isDarkMode} className="flex-1 flex flex-col justify-center hover:border-blue-500/50 transition-all duration-500 group cursor-pointer hover:shadow-xl hover:-translate-y-2" onClick={() => navigate('/employee-login')}>
                    <div className="flex flex-col items-center text-center">
                        {/* Premium 3D Icon Container: Employee */}
                        <div className="h-28 w-28 relative flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(59,130,246,0.5)] border-t border-l border-white/30" />
                            <div className="absolute inset-[2px] bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[1.9rem]" />
                            <div className="relative w-full h-full rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-transparent to-black/10 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                                <User className="text-white drop-shadow-md relative z-10" size={48} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-3 tracking-tight">Employee Login</h2>
                        <p className={`${textMuted} mb-8 leading-relaxed font-light`}>Start your personalized well-being journey with our AI assessment.</p>
                        <Button className="w-full shadow-blue-600/20" onClick={(e: any) => { e.stopPropagation(); navigate('/employee-login'); }}>
                            Start Assessment
                        </Button>
                    </div>
                </Card>

                <Card isDark={isDarkMode} className="flex-1 flex flex-col justify-center hover:border-purple-500/50 transition-all duration-500 group cursor-pointer hover:shadow-xl hover:-translate-y-2" onClick={() => navigate('/hr-login')}>
                    <div className="flex flex-col items-center text-center">
                        {/* Premium 3D Icon Container: HR */}
                        <div className="h-28 w-28 relative flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 bg-purple-500 blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-[2rem] shadow-[0_10px_30px_-5px_rgba(168,85,247,0.5)] border-t border-l border-white/30" />
                            <div className="absolute inset-[2px] bg-gradient-to-br from-fuchsia-500 to-purple-700 rounded-[1.9rem]" />
                            <div className="relative w-full h-full rounded-[2rem] flex items-center justify-center bg-gradient-to-br from-transparent to-black/10 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                                <BriefcaseIcon className="text-white drop-shadow-md relative z-10" size={48} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-3 tracking-tight">HR Portal</h2>
                        <p className={`${textMuted} mb-8 leading-relaxed font-light`}>Monitor organizational health and access detailed analytics.</p>
                        <Button className="w-full shadow-purple-600/20" onClick={(e: any) => { e.stopPropagation(); navigate('/hr-login'); }}>
                            Access Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
