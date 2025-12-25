import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, Button } from '../components/Shared';

interface HrLoginProps {
    isDarkMode: boolean;
    onLogin?: (email: string, password: string) => Promise<boolean>;
}

export const HrLogin = ({ isDarkMode, onLogin }: HrLoginProps) => {
    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        if (!onLogin) {
            navigate('/hr-dashboard');
            return;
        }

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        const success = await onLogin(email, password);
        if (!success) {
            setError('Invalid credentials. Please contact support.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
            <Card isDark={isDarkMode} className="max-w-md w-full !rounded-3xl">
                <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 pl-0 gap-2 w-auto !rounded-xl !px-4 !py-2">
                    <ChevronRight className="rotate-180" size={18} /> Back
                </Button>
                <div className="mb-8">
                    <h2 className="text-4xl font-bold mb-2 tracking-tight">HR Portal</h2>
                    <p className={`${textMuted} font-light`}>Please enter your credentials to continue.</p>
                </div>

                <div className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}
                    <div className="group">
                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${textMuted} `}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl p-4 focus:border-blue-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20`}
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ml-1 ${textMuted} `}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl p-4 focus:border-blue-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20`}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button onClick={handleLogin} className="w-full mt-4 !rounded-2xl">
                        Sign In
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
