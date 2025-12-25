import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertTriangle, Download, Share2, Zap, Activity, Heart, User, Bell, MessageCircle, X, Trash2, Check } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import { CircularGauge, Button, Card } from '../components/Shared';
import { uploadToCloudinary, generateComprehensivePDF } from '../services/utils';
import { subscribeToEmployeeFeedback, deleteEmployeeFeedback, getEmployeeHistory } from '../services/db';
import { UserProfile } from '../types';

interface EmployeeResultProps {
    isDarkMode: boolean;
    userProfile: UserProfile;
    result: any;
    onUpdateProfile: (profile: UserProfile) => void;
}

export const EmployeeResult = ({ isDarkMode, userProfile, result, onUpdateProfile }: EmployeeResultProps) => {
    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const [showSettings, setShowSettings] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessages, setFeedbackMessages] = useState<any[]>([]);
    const [tempProfile, setTempProfile] = useState<UserProfile>({ ...userProfile });
    const [isUploading, setIsUploading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);

    const fetchHistory = async () => {
        if (userProfile && 'id' in userProfile) {
            const data = await getEmployeeHistory((userProfile as any).id);
            setHistoryData(data);
            setShowHistory(true);
        }
    };

    React.useEffect(() => {
        console.log("UserProfile in Result:", userProfile);
        if (userProfile && 'id' in userProfile) {
            console.log("Subscribing to feedback for:", (userProfile as any).id);
            const unsubscribe = subscribeToEmployeeFeedback((userProfile as any).id, (msgs) => {
                console.log("Real-time Messages Result:", msgs);
                setFeedbackMessages(msgs);
            });
            return () => unsubscribe();
        }
    }, [userProfile]);

    const openSettings = () => {
        setTempProfile({ ...userProfile });
        setShowSettings(true);
    };

    const handleUpdateProfile = () => {
        onUpdateProfile(tempProfile);
        setShowSettings(false);
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} `}>
            {/* Top Header */}
            <div className={`relative z-50 flex flex-wrap gap-4 justify-between items-center p-4 md:p-6 md:px-8 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} `}>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                        {userProfile.image ? (
                            <img src={userProfile.image} alt="Employee" className="w-full h-full object-cover" />
                        ) : (
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || 'User')}&background=random`} alt="Employee" />
                        )}
                    </div>
                    <div>
                        <h2 className={`font-bold text-base md:text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} `}>{userProfile.name || 'Employee'}</h2>
                        <p className={`text-[10px] md:text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600 font-semibold'} `}>{userProfile.role || 'Employee Diagnostic'}</p>
                    </div>
                </div>
                <div className="flex flex-nowrap items-center gap-2 md:gap-4 ml-auto">
                    <button onClick={fetchHistory} className={`p-2 rounded-full transition-all hover:scale-110 ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`} title="History & Progress">
                        <Activity size={20} />
                    </button>
                    <button onClick={() => setShowFeedback(true)} className={`relative p-2 rounded-full transition-all hover:scale-110 ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`} title="Notifications">
                        <Bell size={20} />
                        <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${feedbackMessages.length > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    </button>
                    <button onClick={openSettings} className={`p-2 rounded-full transition-all hover:scale-110 ${isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-600'}`} title="Profile Settings">
                        <Settings size={20} />
                    </button>
                    <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <button onClick={() => navigate('/')} className={`whitespace-nowrap text-xs md:text-sm font-bold hover:underline ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} `}>
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 space-y-8">
                <div className="flex justify-center mb-0">
                    <span className={`px-4 py-2 rounded-full border text-sm font-medium ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'} `}>
                        Assessment Overview
                    </span>
                </div>

                {/* Analysis Summary Card */}
                <div className={`p-8 rounded-[2rem] border shadow-[0_8px_30px_rgb(0, 0, 0, 0.04)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 backdrop-blur-xl transition-all hover:shadow-[0_20px_40px_rgb(0, 0, 0, 0.06)] ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-white/60'} `}>
                    <div className="flex gap-6 items-start max-w-3xl">
                        <div className={`p-4 rounded-2xl shrink-0 ${result?.risk === 'High' ? 'bg-red-50 text-red-500' : result?.risk === 'Medium' ? 'bg-yellow-50 text-yellow-500' : 'bg-green-50 text-green-500'} `}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'} `}>Analysis Completed</h2>
                            <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} `}>
                                "{result?.summary || 'Analysis complete.'}"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Level</span>
                        <span className={`text-3xl font-black ${result?.risk === 'High' ? 'text-red-600' : result?.risk === 'Medium' ? 'text-yellow-600' : 'text-emerald-600'} `}>
                            {result?.risk}
                        </span>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setShowReportModal(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm hover:shadow-md ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                            >
                                <Download size={16} /> Generate Report
                            </button>
                        </div>

                    </div>
                </div>

                {/* Metric Cards Row */}
                <div className="grid md:grid-cols-3 gap-6">
                    <CircularGauge
                        value={result?.metrics?.focus || 85}
                        label="FOCUS LEVEL"
                        color="text-emerald-500"
                        bgClass="bg-purple-100"
                        icon={<Zap strokeWidth={1.5} size={24} className="text-purple-500" />}
                        isDark={isDarkMode}
                    />
                    <CircularGauge
                        value={result?.metrics?.stress || 25}
                        label="STRESS LEVEL"
                        color="text-rose-500"
                        bgClass="bg-rose-100"
                        icon={<Activity strokeWidth={1.5} size={24} className="text-rose-500" />}
                        isDark={isDarkMode}
                    />
                    <CircularGauge
                        value={result?.metrics?.satisfaction || 95}
                        label="SATISFACTION"
                        color="text-emerald-500"
                        bgClass="bg-emerald-100"
                        icon={<Heart strokeWidth={1.5} size={24} className="text-emerald-500" />}
                        isDark={isDarkMode}
                    />
                </div>

                {/* Bottom Row: Recs & Trends */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Recommendations */}
                    <div className={`p-8 rounded-[2rem] border shadow-[0_8px_30px_rgb(0, 0, 0, 0.04)] backdrop-blur-xl transition-all hover:shadow-[0_20px_40px_rgb(0, 0, 0, 0.06)] ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-white/60'} `}>
                        <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-500 pl-4">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'} `}>AI Recommendations</h3>
                        </div>
                        <div className="space-y-4">
                            {result?.recommendations?.map((rec: string, i: number) => (
                                <div key={i} className={`flex gap-4 p-5 rounded-2xl transition-all border shadow-sm hover:translate-x-1 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'} backdrop-blur-sm`}>
                                    <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <p className={`text-sm leading-relaxed font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'} `}>{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trends Chart */}
                    <div className={`p-8 rounded-[2rem] border shadow-[0_8px_30px_rgb(0, 0, 0, 0.04)] flex flex-col backdrop-blur-xl transition-all hover:shadow-[0_20px_40px_rgb(0, 0, 0, 0.06)] ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/80 border-white/60'} `}>
                        <div className="flex items-center gap-3 mb-8">
                            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'} `}>Well-being Trends</h3>
                        </div>
                        <div className="flex-1 min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Week 1', score: 65 },
                                    { name: 'Week 2', score: 58 },
                                    { name: 'Week 3', score: 80 },
                                    { name: 'Today', score: Number(result?.score || 85) },
                                ]} barGap={8}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        stroke={isDarkMode ? "#94a3b8" : "#334155"}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                        fontSize={12}
                                        fontWeight={700}
                                        tick={{ fill: isDarkMode ? '#94a3b8' : '#334155' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: isDarkMode ? '#fff' : '#1e293b', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 6, 6]} barSize={32} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-slate-500 mt-6 font-bold uppercase tracking-widest">Overall Wellness Score Over Time</p>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
                    <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Profile Settings</h3>
                            <button onClick={() => setShowSettings(false)} className={`p-2 rounded-full hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800' : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 5L5 15M5 5l10 10" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Image Upload */}
                            <div className="flex justify-center">
                                <div className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 ${tempProfile.image ? 'border-transparent' : 'border-slate-300 hover:border-blue-500'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setIsUploading(true);
                                                const url = await uploadToCloudinary(file);
                                                setIsUploading(false);
                                                if (url) setTempProfile(prev => ({ ...prev, image: url }));
                                            }
                                        }}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center animate-pulse">
                                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : tempProfile.image ? (
                                        <img src={tempProfile.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <div className="bg-slate-100 rounded-full p-2 mb-1 mx-auto w-fit"><User size={16} className="text-slate-400" /></div>
                                            <span className="text-[10px] font-bold text-slate-400">CHANGE</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Full Name</label>
                                    <input
                                        type="text"
                                        value={tempProfile.name}
                                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                        className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                        placeholder="e.g. Alex Murphy"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Role / Title</label>
                                    <input
                                        type="text"
                                        value={tempProfile.role}
                                        onChange={(e) => setTempProfile({ ...tempProfile, role: e.target.value })}
                                        className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                        placeholder="Designer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Age</label>
                                    <input
                                        type="number"
                                        value={tempProfile.age}
                                        onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                                        className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                        placeholder="28"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">New Password</label>
                                    <input
                                        type="password"
                                        value={tempProfile.password || ''}
                                        onChange={(e) => setTempProfile({ ...tempProfile, password: e.target.value })}
                                        className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                        placeholder="Enter new password to update"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
                                >
                                    Cancel
                                </button>
                                <Button
                                    className="flex-1 shadow-xl shadow-blue-500/20"
                                    onClick={handleUpdateProfile}
                                    disabled={!tempProfile.name}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <Activity size={20} className="text-purple-500" /> My Progress
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => generateComprehensivePDF(historyData, userProfile, result)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDarkMode ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                                >
                                    <Download size={14} /> Download PDF
                                </button>
                                <button onClick={() => setShowHistory(false)} className={`p-2 rounded-full hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800' : ''}`}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                            {/* Chart */}
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={historyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(val) => new Date(val).toLocaleDateString()}
                                            stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                                            fontSize={12}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            labelStyle={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Records List */}
                            <div className="space-y-3">
                                <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Previous Results</h4>
                                {historyData.length > 0 ? (
                                    <div className="grid gap-3">
                                        {historyData.slice().reverse().map((record, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                <div>
                                                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{new Date(record.date).toLocaleDateString()}</p>
                                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(record.date).toLocaleTimeString()}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${record.risk === 'High' ? 'bg-red-100 text-red-600' : record.risk === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                                        {record.risk} Risk
                                                    </div>
                                                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{record.score}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">No history records found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeedback(false)}>
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className="text-xl font-black flex items-center gap-2">
                                <MessageCircle size={20} className="text-blue-500" /> HR Feedback
                            </h3>
                            <button onClick={() => setShowFeedback(false)} className={`p-2 rounded-full hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800' : ''}`}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {feedbackMessages.length > 0 ? (
                                <div className="divide-y dark:divide-slate-800">
                                    {feedbackMessages.map((msg, idx) => (
                                        <div key={idx} className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(msg.date).toLocaleString()}</p>

                                                {deleteId === msg.id ? (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                                        <span className="text-xs font-bold text-red-500">Confirm?</span>
                                                        <button
                                                            onClick={() => { deleteEmployeeFeedback(msg.id); setDeleteId(null); }}
                                                            className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(null)}
                                                            className={`p-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteId(msg.id)}
                                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-500 ${isDarkMode ? 'hover:bg-red-900/20' : ''}`}
                                                        title="Delete Message"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm leading-relaxed pr-8">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                    <p>No feedback messages yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Report Type Selection Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
                    <div className={`w-full max-w-sm rounded-3xl shadow-2xl p-6 ${isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <h3 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Generate Report</h3>
                            <p className="text-sm text-slate-500 font-medium">Select report timeline</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                onClick={() => { generateComprehensivePDF(historyData, userProfile, result, 'Daily'); setShowReportModal(false); }}
                                className={`p-4 rounded-xl flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 hover:border-blue-500/50 border border-slate-700' : 'bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 border border-slate-100'}`}
                            >
                                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Daily Report</span>
                                <Download size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => { generateComprehensivePDF(historyData, userProfile, result, 'Weekly'); setShowReportModal(false); }}
                                className={`p-4 rounded-xl flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 hover:border-purple-500/50 border border-slate-700' : 'bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-purple-500/10 border border-slate-100'}`}
                            >
                                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Weekly Summary</span>
                                <Download size={18} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => { generateComprehensivePDF(historyData, userProfile, result, 'Monthly'); setShowReportModal(false); }}
                                className={`p-4 rounded-xl flex items-center justify-between group transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 hover:border-emerald-500/50 border border-slate-700' : 'bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/10 border border-slate-100'}`}
                            >
                                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Monthly Overview</span>
                                <Download size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                        <button onClick={() => setShowReportModal(false)} className="w-full mt-6 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
