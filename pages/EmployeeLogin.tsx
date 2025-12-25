import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, BadgeCheck, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../components/Shared';

interface EmployeeLoginProps {
    isDarkMode: boolean;
    onLogin: (email: string, password?: string) => Promise<boolean>;
}

export const EmployeeLogin = ({ isDarkMode, onLogin }: EmployeeLoginProps) => {
    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        const success = await onLogin(email, password);
        if (!success) {
            setError('Invalid email or employee not found. Please contact HR.');
        }
    };

    return (
        <div className="flex flex-col p-6 items-center justify-center min-h-screen relative z-10 transition-all duration-500">
            <Card isDark={isDarkMode} className="w-full max-w-md !p-12 relative overflow-hidden group">
                {/* Back Button */}
                <button onClick={() => navigate('/')} className={`absolute top-8 left-8 flex items-center gap-2 text-sm font-bold ${textMuted} hover:text-blue-500 transition-colors`}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="mt-8 mb-8">
                    <h2 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'} `}>Welcome</h2>
                    <p className={`${textMuted} `}>Please enter your credentials.</p>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 tracking-wider">EMAIL ADDRESS</label>
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'} `}>
                            <Mail size={20} className="text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="bg-transparent outline-none w-full font-medium placeholder:text-slate-400"
                            />
                        </div>
                    </div>



                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 tracking-wider">PASSWORD</label>
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'} `}>
                            <Lock size={20} className="text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-transparent outline-none w-full font-medium placeholder:text-slate-400 tracking-widest"
                            />
                        </div>
                    </div>

                    <button onClick={handleLogin} className="w-full py-4 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                        Sign In <ArrowRight size={20} />
                    </button>
                </div>
            </Card>
        </div>
    );
};
