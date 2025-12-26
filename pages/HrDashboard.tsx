import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Settings, LogOut, AlertTriangle, Trash2, Plus, Users, UserPlus, Upload, User as UserIcon, Edit2, MessageSquare, X, CheckCircle, Settings2, Bell, ClipboardList } from 'lucide-react';
import { uploadToCloudinary } from '../services/utils';
import { EmployeeWithAuth } from '../types';
import { getNotifications, addNotification, deleteNotification, updateAdmin, getAdmin } from '../services/db';
import {
    BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Button, Card, NavItem } from '../components/Shared';

interface Question { id: number; text: string; category?: string; isHidden?: boolean; }

interface HrDashboardProps {
    isDarkMode: boolean;
    questions: Question[];
    onAddQuestion: (text: string, category: string) => void;
    onDeleteQuestion: (id: number) => void;
    onToggleQuestion: (id: number) => void;
    employees: EmployeeWithAuth[];
    onAddEmployee: (emp: EmployeeWithAuth) => void;
    onUpdateEmployee: (emp: EmployeeWithAuth, oldId?: string) => void;
    onDeleteEmployee: (id: string) => void;
    onSendFeedback: (id: string, message: string) => void;
}

type HrTab = 'OVERVIEW' | 'EMPLOYEES' | 'SETTINGS';

export const HrDashboard = ({ isDarkMode, questions, onAddQuestion, onDeleteQuestion, onToggleQuestion, employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, onSendFeedback }: HrDashboardProps) => {
    // ... (placeholder, I need to find the interface first) (existing code)

    const realStats = React.useMemo(() => {
        const assessed = employees.filter(e => e.lastAssessment);
        const total = assessed.length;
        if (total === 0) return [
            // Mock Data for Demo Visualization
            { name: 'Burnout Risk', value: 12, color: 'bg-red-500' },
            { name: 'Healthy', value: 64, color: 'bg-green-500' },
            { name: 'Moderate Stress', value: 24, color: 'bg-yellow-500' },
        ];

        const high = assessed.filter(e => e.lastAssessment?.risk === 'High').length;
        const medium = assessed.filter(e => e.lastAssessment?.risk === 'Medium').length;
        const low = assessed.filter(e => e.lastAssessment?.risk === 'Low').length;

        return [
            { name: 'Burnout Risk', value: Math.round((high / total) * 100), color: 'bg-red-500' },
            { name: 'Healthy', value: Math.round((low / total) * 100), color: 'bg-green-500' },
            { name: 'Moderate Stress', value: Math.round((medium / total) * 100), color: 'bg-yellow-500' },
        ];
    }, [employees]);

    // Calculate Chart Data by Role/Department
    const realChartData = React.useMemo(() => {
        const roleGroups: Record<string, { stressSum: number, satSum: number, count: number }> = {};

        employees.forEach(emp => {
            if (emp.lastAssessment && emp.lastAssessment.metrics) {
                // Use explicit Role if available, or default to 'General'
                const role = emp.role || 'General';
                // Group common roles to avoid clutter (Optional, but good for UI)
                // e.g. "Software Engineer" -> "Engineering"

                if (!roleGroups[role]) {
                    roleGroups[role] = { stressSum: 0, satSum: 0, count: 0 };
                }

                roleGroups[role].stressSum += emp.lastAssessment.metrics.stress || 0;
                roleGroups[role].satSum += emp.lastAssessment.metrics.satisfaction || 0;
                roleGroups[role].count++;
            }
        });

        const data = Object.keys(roleGroups).map(role => ({
            name: role,
            stress: Math.round(roleGroups[role].stressSum / roleGroups[role].count),
            satisfaction: Math.round(roleGroups[role].satSum / roleGroups[role].count)
        }));

        // Fallback for empty data - SHOW MOCK DATA FOR DEMO
        if (data.length === 0) {
            return [
                { name: 'Engineering', stress: 65, satisfaction: 45 },
                { name: 'Sales', stress: 45, satisfaction: 80 },
                { name: 'Marketing', stress: 30, satisfaction: 85 },
                { name: 'HR', stress: 20, satisfaction: 90 },
            ];
        }

        return data;
    }, [employees]);

    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const [hrTab, setHrTab] = useState<HrTab>('OVERVIEW');
    const [newQuestionText, setNewQuestionText] = useState("");
    const [newQuestionCategory, setNewQuestionCategory] = useState("Psychological Well-being");
    const [qFilter, setQFilter] = useState('All');
    const [qPage, setQPage] = useState(1);
    const QUESTIONS_PER_PAGE = 5;

    // Employee Form State
    const [isAddingEmployee, setIsAddingEmployee] = useState(false);
    const [isEditingEmployee, setIsEditingEmployee] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Feedback Modal State
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [originalEmployeeId, setOriginalEmployeeId] = useState<string | null>(null);

    // Admin Profile State for Settings
    const [hrProfileModalOpen, setHrProfileModalOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState<any>(null);

    useEffect(() => {
        const loadAdmin = async () => {
            const savedAdmin = localStorage.getItem('happynation_admin');
            if (savedAdmin) {
                const parsed = JSON.parse(savedAdmin);
                // Set optimistic
                setAdminProfile(parsed);
                // Fetch fresh
                if (parsed.email) {
                    const fresh = await getAdmin(parsed.email);
                    if (fresh) {
                        setAdminProfile(fresh);
                        localStorage.setItem('happynation_admin', JSON.stringify(fresh));
                    }
                }
            }
        };
        loadAdmin();
    }, []);

    const handleUpdateAdminProfile = async (newProfile: any) => {
        if (!adminProfile?.email) {
            alert("Session incomplete. Please logout and login again to save changes.");
            return;
        }

        const success = await updateAdmin(adminProfile.email, newProfile);
        if (success) {
            setAdminProfile(newProfile);
            localStorage.setItem('happynation_admin', JSON.stringify(newProfile));
            setHrProfileModalOpen(false);
            setFeedbackMessage("Profile updated successfully!");
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Survey Config State
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedConfigEmployee, setSelectedConfigEmployee] = useState<EmployeeWithAuth | null>(null);
    const [tempConfig, setTempConfig] = useState<{
        frequency: 'daily' | 'weekly' | 'monthly';
        questionCount: number;
        questionTypes: string[];
        isSurveyVisible: boolean;
        scheduledDate: string;
    }>({
        frequency: 'daily',
        questionCount: 5,
        questionTypes: ['Psychological Well-being'],
        isSurveyVisible: true,
        scheduledDate: ''
    });

    const handleConfigClick = (emp: EmployeeWithAuth) => {
        setSelectedConfigEmployee(emp);
        setTempConfig({
            frequency: emp.surveyConfig?.frequency || 'daily',
            questionCount: emp.surveyConfig?.questionCount || 5,
            questionTypes: emp.surveyConfig?.questionTypes || ['Psychological Well-being', 'Work Environment'],
            isSurveyVisible: emp.surveyConfig?.isSurveyVisible ?? true,
            scheduledDate: emp.surveyConfig?.scheduledDate || ''
        });
        setSettingsModalOpen(true);
    };

    const handleSaveConfig = async () => {
        if (selectedConfigEmployee) {
            const updatedEmp = { ...selectedConfigEmployee, surveyConfig: tempConfig };



            // Send notification if scheduled
            if (!tempConfig.isSurveyVisible && tempConfig.scheduledDate) {
                const date = new Date(tempConfig.scheduledDate).toLocaleString();
                await addNotification({
                    employeeId: selectedConfigEmployee.id,
                    type: 'alert',
                    message: `New survey scheduled for ${date}.`,
                    read: false,
                    date: new Date().toISOString()
                });
            }

            onUpdateEmployee(updatedEmp as EmployeeWithAuth);
            setSettingsModalOpen(false);
            setShowToast(true);
        }
    };

    const [newEmployee, setNewEmployee] = useState<EmployeeWithAuth>({
        id: '',
        name: '',
        role: '',
        age: '',
        image: null,
        password: ''
    });

    const [notifications, setNotifications] = useState<any[]>([]);

    React.useEffect(() => {
        const loadNotifs = async () => {
            const data = await getNotifications();
            setNotifications(data);
        };
        loadNotifs();
    }, [hrTab]);

    const resetForm = () => {
        setNewEmployee({ id: '', name: '', role: '', age: '', image: null, password: '' });
        setIsAddingEmployee(false);
        setIsEditingEmployee(false);
        setFeedbackModalOpen(false);
        setFeedbackMessage("");
        setSelectedEmployeeId(null);
    };

    const handleDeleteNotification = async (notifId: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        await deleteNotification(notifId); // We imported this earlier
    };

    const [showAllNotifications, setShowAllNotifications] = useState(false);

    const handleCreateEmployee = () => {
        if (!newEmployee.id || !newEmployee.name) return;
        onAddEmployee(newEmployee);
        resetForm();
    };

    const handleUpdateSubmit = () => {
        if (!newEmployee.id || !newEmployee.name) return;
        onUpdateEmployee(newEmployee, originalEmployeeId || undefined);
        resetForm();
    };

    const handleEditClick = (emp: EmployeeWithAuth) => {
        setNewEmployee(emp);
        setOriginalEmployeeId(emp.id);
        setIsEditingEmployee(true);
        setIsAddingEmployee(false);
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm("Are you sure you want to delete this employee? This cannot be undone.")) {
            onDeleteEmployee(id);
        }
    };

    const handleFeedbackClick = (id: string) => {
        setSelectedEmployeeId(id);
        setFeedbackModalOpen(true);
    };

    const submitFeedback = () => {
        if (selectedEmployeeId && feedbackMessage) {
            onSendFeedback(selectedEmployeeId, feedbackMessage);
            setShowToast(true);
            resetForm();
        }
    };

    const handleAdd = () => {
        if (!newQuestionText.trim()) return;
        onAddQuestion(newQuestionText, newQuestionCategory);
        setNewQuestionText("");
    };

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Feedback Modal */}
            {feedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card isDark={isDarkMode} className="w-full max-w-md relative animate-in fade-in zoom-in duration-300">
                        <button onClick={resetForm} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Send Feedback</h3>
                        <p className={`text-sm mb-4 ${textMuted}`}>Send a private message or feedback regarding the employee's well-being report.</p>
                        <textarea
                            className={`w-full h-32 p-4 rounded-xl border outline-none resize-none mb-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                            placeholder="Type your feedback here..."
                            value={feedbackMessage}
                            onChange={(e) => setFeedbackMessage(e.target.value)}
                        />
                        <Button onClick={submitFeedback} className="w-full">Send Feedback</Button>
                    </Card>
                </div>
            )}

            {/* Custom Toast Notification */}
            {showToast && (
                <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900 border border-slate-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Success</p>
                        <p className={`text-xs ${textMuted}`}>Feedback sent successfully.</p>
                    </div>
                </div>
            )}

            <div className={`w-24 lg:w-72 border-r p-6 flex flex-col hidden md:flex backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/50 border-slate-200'} `}>
                <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className={`relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-lg transition-transform duration-500 group-hover:rotate-12 ${isDarkMode ? 'border-white/10 bg-slate-800' : 'border-white bg-slate-50'}`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img src={`${import.meta.env.BASE_URL || '/'}logo.png`} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                    <span className={`font-black text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-white via-slate-200 to-slate-400' : 'from-slate-900 via-slate-700 to-slate-500'}`}>
                        Happynation
                    </span>
                </div>

                <nav className="space-y-4 flex-1">
                    <NavItem active={hrTab === 'OVERVIEW'} onClick={() => setHrTab('OVERVIEW')} isDark={isDarkMode} icon={<PieChart size={24} />}><span className="hidden lg:block">Overview</span></NavItem>
                    <NavItem active={hrTab === 'EMPLOYEES'} onClick={() => setHrTab('EMPLOYEES')} isDark={isDarkMode} icon={<Users size={24} />}><span className="hidden lg:block">Employees</span></NavItem>
                    <NavItem active={hrTab === 'SETTINGS'} onClick={() => setHrTab('SETTINGS')} isDark={isDarkMode} icon={<ClipboardList size={24} />}><span className="hidden lg:block">Manage Survey</span></NavItem>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 my-2"></div>
                    <NavItem active={hrProfileModalOpen} onClick={() => setHrProfileModalOpen(true)} isDark={isDarkMode} icon={<UserIcon size={24} />}><span className="hidden lg:block">Admin Profile</span></NavItem>
                </nav>

                <button onClick={() => navigate('/')} className={`flex items-center gap-4 transition-colors p-4 rounded-2xl justify-center lg:justify-start ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} `}>
                    <LogOut size={24} /> <span className="hidden lg:block">Logout</span>
                </button>
            </div>

            <div className="flex-1 p-6 lg:p-10 overflow-y-auto relative z-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
                        <p className={`${textMuted} mt-2`}>
                            {hrTab === 'OVERVIEW' ? 'Organization Health Overview' : (hrTab === 'EMPLOYEES' ? 'Manage Workforce' : 'Manage Survey Questions')}
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-3 p-2 rounded-2xl">
                            <div className="text-right hidden md:block">
                                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{adminProfile?.name || 'Admin User'}</p>
                                <p className={`text-xs ${textMuted}`}>{adminProfile?.email || 'admin@happynation.com'}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full overflow-hidden border border-slate-200">
                                <img src={adminProfile?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminProfile?.name || 'Admin User')}&background=random`} alt="Admin" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* OVERVIEW CONTENT */}
                {hrTab === 'OVERVIEW' && (
                    <>
                        <div className="grid md:grid-cols-3 gap-6 mb-10">
                            {realStats.map(stat => (
                                <Card isDark={isDarkMode} key={stat.name} className="flex flex-col items-center justify-center gap-2 border-0 hover:scale-105 transition-transform cursor-pointer group !py-6">
                                    <div className="w-full flex justify-between items-start mb-2">
                                        <p className={`text-xs font-bold uppercase tracking-widest ${textMuted} `}>{stat.name}</p>
                                        <div className={`w-3 h-3 rounded-full ${stat.color} shadow-[0_0_10px_currentColor]`} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-5xl font-black tracking-tighter">{stat.value}%</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <Card isDark={isDarkMode} className="lg:col-span-2 !p-0 overflow-hidden">
                                <div className={`p-8 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'} `}>
                                    <h3 className="font-bold text-xl">Well-Being Trends</h3>
                                </div>
                                <div className="h-[350px] p-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={realChartData} barGap={8}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                                            <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#64748b"} axisLine={false} tickLine={false} dy={10} />
                                            <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', radius: 8 }} contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="stress" fill="#f87171" radius={[10, 10, 10, 10]} barSize={12} />
                                            <Bar dataKey="satisfaction" fill="#4ade80" radius={[10, 10, 10, 10]} barSize={12} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card isDark={isDarkMode} className="!p-0 overflow-hidden flex flex-col">
                                <div className={`p-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'} `}>
                                    <h3 className="font-bold text-xl">Recent Notifications</h3>
                                </div>
                                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.slice(0, 4).map((notif, i) => {
                                        // Try to find live employee data first
                                        const liveEmp = employees.find(e => e.id === notif.employeeId);
                                        const displayImage = liveEmp?.image || notif.image;

                                        return (
                                            <div key={i} className={`relative flex items-start gap-4 p-4 rounded-3xl border transition-colors cursor-pointer group ${isDarkMode ? 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'} `}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} `}>
                                                    {displayImage ? (
                                                        <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : notif.type === 'PROFILE_UPDATE' ? (
                                                        <UserIcon className="text-blue-400" size={20} />
                                                    ) : (
                                                        <AlertTriangle className="text-yellow-400" size={20} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm group-hover:text-blue-500 transition-colors">{notif.message}</p>
                                                    <p className={`text-xs ${textMuted} mt-1`}>{new Date(notif.date).toLocaleString()}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notif.id);
                                                    }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete Notification"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    }) : (
                                        <p className={`text-center py-4 ${textMuted}`}>No new notifications.</p>
                                    )}

                                    {notifications.length > 4 && (
                                        <button
                                            onClick={() => setShowAllNotifications(true)}
                                            className="w-full py-2 text-sm font-bold text-blue-500 hover:underline"
                                        >
                                            See More
                                        </button>
                                    )}
                                </div>
                            </Card>

                            {/* All Notifications Modal */}
                            {showAllNotifications && (
                                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAllNotifications(false)}>
                                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                                        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                            <h3 className="font-bold text-xl">All Notifications</h3>
                                            <button onClick={() => setShowAllNotifications(false)} className={`p-2 rounded-full hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800' : ''}`}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="p-6 overflow-y-auto space-y-4">
                                            {notifications.map((notif, i) => {
                                                const liveEmp = employees.find(e => e.id === notif.employeeId);
                                                const displayImage = liveEmp?.image || notif.image;
                                                return (
                                                    <div key={i} className={`relative flex items-start gap-4 p-4 rounded-3xl border transition-colors group ${isDarkMode ? 'bg-slate-800/30 border-slate-700/30' : 'bg-slate-50 border-slate-100'} `}>
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} `}>
                                                            {displayImage ? (
                                                                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                                                            ) : notif.type === 'PROFILE_UPDATE' ? (
                                                                <UserIcon className="text-blue-400" size={20} />
                                                            ) : (
                                                                <AlertTriangle className="text-yellow-400" size={20} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-sm">{notif.message}</p>
                                                            <p className={`text-xs ${textMuted} mt-1`}>{new Date(notif.date).toLocaleString()}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteNotification(notif.id)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                            title="Delete Notification"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )
                }

                {/* EMPLOYEES TAB */}
                {
                    hrTab === 'EMPLOYEES' && (
                        <div className="space-y-6">
                            {!isAddingEmployee && !isEditingEmployee ? (
                                <Card isDark={isDarkMode} className="!p-0 overflow-hidden">
                                    <div className={`p-8 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'} `}>
                                        <h3 className="font-bold text-xl">Employee Directory</h3>
                                        <Button onClick={() => setIsAddingEmployee(true)} className="!rounded-xl px-4 py-2 text-sm">
                                            <UserPlus size={18} /> Add Employee
                                        </Button>
                                    </div>
                                    <div className="p-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                                            {employees.map((emp, idx) => (
                                                <div key={idx} className={`relative flex flex-col gap-4 p-6 rounded-3xl border transition-all hover:shadow-lg ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-blue-200'} `}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border shrink-0">
                                                            {emp.image ? (
                                                                <img src={emp.image} alt={emp.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center"><UserIcon size={24} className="text-slate-400" /></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg">{emp.name}</p>
                                                            <p className={`text-sm ${textMuted}`}>{emp.role}</p>
                                                            {emp.lastAssessment && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${emp.lastAssessment.risk === 'High' ? 'bg-red-500/10 text-red-500' :
                                                                        (emp.lastAssessment.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500')
                                                                        }`}>
                                                                        Risk: {emp.lastAssessment.risk}
                                                                    </span>
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500`}>
                                                                        Score: {emp.lastAssessment.score}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={`h-px w-full ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />

                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditClick(emp)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-blue-500 hover:text-white' : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-600'} `}>
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteClick(emp.id)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-red-500 hover:text-white' : 'bg-slate-50 hover:bg-red-50 hover:text-red-600'} `}>
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleFeedbackClick(emp.id)} className={`flex-[2] flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} `}>
                                                            <MessageSquare size={14} /> Send Feedback
                                                        </button>
                                                        <button onClick={() => handleConfigClick(emp)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'} `} title="Survey Settings">
                                                            <Settings2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {employees.length === 0 && (
                                                <div className={`col-span-full py-12 text-center border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                                    <p>No employees yet. Click "Add Employee" to create one.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card isDark={isDarkMode} className="max-w-2xl mx-auto">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-black mb-2">{isEditingEmployee ? 'Edit Employee' : 'Create Employee Profile'}</h2>
                                        <p className={`${textMuted}`}>{isEditingEmployee ? 'Update employee details.' : 'Enter employee details and set up their profile.'}</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Image Upload */}
                                        <div className="flex justify-center mb-6">
                                            <div className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 ${newEmployee.image ? 'border-transparent' : 'border-slate-300 hover:border-blue-500'}`}>
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
                                                            if (url) setNewEmployee(prev => ({ ...prev, image: url }));
                                                        }
                                                    }}
                                                    disabled={isUploading}
                                                />
                                                {isUploading ? (
                                                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center animate-pulse">
                                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                ) : newEmployee.image ? (
                                                    <img src={newEmployee.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <div className="bg-slate-100 rounded-full p-2 mb-1 mx-auto w-fit"><Upload size={16} className="text-slate-400" /></div>
                                                        <span className="text-[10px] font-bold text-slate-400">UPLOAD</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={newEmployee.name}
                                                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                                    className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                                    placeholder="e.g. Alex Murphy"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email (Login ID)</label>
                                                <input
                                                    type="email"
                                                    value={newEmployee.id}
                                                    // disabled={isEditingEmployee} -> Removed to allow editing
                                                    onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                                                    className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                                    placeholder="name@company.com"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Password</label>
                                                <input
                                                    type="password"
                                                    value={newEmployee.password || ''}
                                                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                                    className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Role / Title</label>
                                                <input
                                                    type="text"
                                                    value={newEmployee.role}
                                                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                                    className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                                    placeholder="Designer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Age</label>
                                                <input
                                                    type="number"
                                                    value={newEmployee.age}
                                                    onChange={(e) => setNewEmployee({ ...newEmployee, age: e.target.value })}
                                                    className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                                    placeholder="28"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button onClick={resetForm} className={`flex-1 py-3 font-bold rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>Cancel</button>
                                            <Button onClick={isEditingEmployee ? handleUpdateSubmit : handleCreateEmployee} className="flex-1 shadow-lg shadow-blue-500/20" disabled={!newEmployee.name || !newEmployee.id}>
                                                {isEditingEmployee ? 'Update Account' : 'Create Account'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )
                }



                {/* Survey Settings Modal */}
                {
                    settingsModalOpen && selectedConfigEmployee && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <Card isDark={isDarkMode} className="w-full max-w-4xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                                <button onClick={() => setSettingsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10">
                                    <X size={20} />
                                </button>

                                <div className="mb-6 flex-shrink-0">
                                    <h3 className="text-xl font-bold mb-1">Survey Configuration</h3>
                                    <p className={`text-sm ${textMuted}`}>Customize assessment settings for {selectedConfigEmployee.name}.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        {/* Left Column: General Settings */}
                                        <div className="space-y-6">
                                            {/* Frequency */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Survey Frequency</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['daily', 'weekly', 'monthly'].map((freq) => (
                                                        <button
                                                            key={freq}
                                                            onClick={() => setTempConfig(prev => ({ ...prev, frequency: freq as any }))}
                                                            className={`py-2 rounded-lg text-sm font-bold capitalize transition-all border-2 ${tempConfig.frequency === freq
                                                                ? (isDarkMode ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-500 border-blue-500 text-white')
                                                                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-200')
                                                                }`}
                                                        >
                                                            {freq}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Question Count */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Number of Questions</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="range"
                                                        min="3"
                                                        max="25"
                                                        step="1"
                                                        value={tempConfig.questionCount}
                                                        onChange={(e) => setTempConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                                                    />
                                                    <div className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                        {tempConfig.questionCount}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Visibility & Scheduling */}
                                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <label className="text-sm font-bold block">Survey Visibility</label>
                                                        <p className="text-xs text-slate-500">Control if the employee can see the survey.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setTempConfig(prev => ({ ...prev, isSurveyVisible: !prev.isSurveyVisible }))}
                                                        className={`relative w-12 h-6 rounded-full transition-colors ${tempConfig.isSurveyVisible ? 'bg-blue-500' : 'bg-slate-300'}`}
                                                    >
                                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${tempConfig.isSurveyVisible ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </button>
                                                </div>

                                                {!tempConfig.isSurveyVisible && (
                                                    <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Schedule Availability</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="datetime-local"
                                                                value={tempConfig.scheduledDate || ''}
                                                                onChange={(e) => setTempConfig(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                                                className={`w-full p-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'}`}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-2">
                                                            <Bell size={10} className="inline mr-1" />
                                                            Employee will be notified when survey becomes available.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column: Question Categories */}
                                        <div className="space-y-3 h-full flex flex-col">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Focus Areas (Question Types)</label>
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px] md:max-h-full">
                                                {['Psychological Well-being', 'Work Environment', 'Workload & Stress', 'Social Dynamics', 'Physical Health'].map((type) => (
                                                    <label key={type} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${tempConfig.questionTypes.includes(type)
                                                        ? (isDarkMode ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-200')
                                                        : (isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200')
                                                        }`}>
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${tempConfig.questionTypes.includes(type) ? 'bg-blue-500 border-blue-500' : 'border-slate-400'
                                                            }`}>
                                                            {tempConfig.questionTypes.includes(type) && <CheckCircle size={12} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={tempConfig.questionTypes.includes(type)}
                                                            onChange={() => {
                                                                setTempConfig(prev => {
                                                                    const types = prev.questionTypes.includes(type)
                                                                        ? prev.questionTypes.filter(t => t !== type)
                                                                        : [...prev.questionTypes, type];
                                                                    return { ...prev, questionTypes: types };
                                                                });
                                                            }}
                                                        />
                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                                    <Button onClick={handleSaveConfig} className="w-full shadow-lg shadow-blue-500/20 py-3 md:py-4 text-base">
                                        Save Configuration
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )
                }


                {/* SETTINGS CONTENT */}
                {
                    hrTab === 'SETTINGS' && (
                        <div className="space-y-6">
                            <Card isDark={isDarkMode} className="!p-0 overflow-hidden">
                                <div className={`p-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'} `}>
                                    <h3 className="font-bold text-xl">Manage Survey Questions</h3>
                                </div>
                                <div className="p-8">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <select
                                                value={newQuestionCategory}
                                                onChange={(e) => setNewQuestionCategory(e.target.value)}
                                                className={`w-1/3 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                                            >
                                                {['Psychological Well-being', 'Work Environment', 'Workload & Stress', 'Social Dynamics', 'Physical Health'].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <input
                                                value={newQuestionText}
                                                onChange={(e) => setNewQuestionText(e.target.value)}
                                                placeholder="Type a new question..."
                                                className={`flex-1 p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'} `}
                                            />
                                            <Button onClick={handleAdd} className="!rounded-xl px-6">
                                                <Plus size={20} /> Add
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mt-8">
                                        {questions.map((q) => (
                                            <div key={q.id} className={`flex justify-between items-center p-4 rounded-xl border group hover:border-blue-500/30 transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} `}>
                                                <div className="space-y-1">
                                                    <p className="font-medium">{q.id}. {q.text}</p>
                                                    {q.category && (
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md inline-block ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                                            {q.category}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => onDeleteQuestion(q.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )
                }
            </div >

            {/* HR Profile Modal */}
            {hrProfileModalOpen && adminProfile && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setHrProfileModalOpen(false)}>
                    <div className={`w-full max-w-4xl rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">Admin Profile</h3>
                            <button onClick={() => setHrProfileModalOpen(false)} className={`p-2 rounded-full hover:bg-slate-100 ${isDarkMode ? 'hover:bg-slate-800' : ''}`}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* LEFT COLUMN: IMAGE */}
                            <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-8 md:pb-0 md:pr-8">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 w-full text-center">Profile Picture</h4>
                                <div className={`relative w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 shadow-xl ${adminProfile.image ? 'border-transparent' : 'border-slate-300 hover:border-blue-500'}`}>
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

                                                if (url) {
                                                    const updatedProfile = { ...adminProfile, image: url };
                                                    setAdminProfile(updatedProfile);
                                                    if (adminProfile.email) {
                                                        const success = await updateAdmin(adminProfile.email, updatedProfile);
                                                        if (success) {
                                                            localStorage.setItem('happynation_admin', JSON.stringify(updatedProfile));
                                                            setFeedbackMessage("Profile image updated successfully!");
                                                            setShowToast(true);
                                                            setTimeout(() => setShowToast(false), 3000);
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                    {adminProfile.image ? (
                                        <img src={adminProfile.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2"><UserIcon size={40} className="text-slate-400 mx-auto" /></div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-4 text-center">Click to upload new picture.<br />Auto-saves instantly.</p>
                            </div>

                            {/* RIGHT COLUMN: FORM */}
                            <div className="w-full md:w-2/3 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                        <input
                                            value={adminProfile.name || ''}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                            className={`w-full p-4 rounded-xl border outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                                        <div className={`w-full p-4 rounded-xl border font-bold flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                                        >
                                            <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-1 rounded uppercase tracking-wide">Fixed</span>
                                            HR Admin
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                                        <input
                                            type="password"
                                            value={adminProfile.newPassword || ''}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, newPassword: e.target.value })}
                                            className={`w-full p-4 rounded-xl border outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={() => handleUpdateAdminProfile(adminProfile)} className="w-full md:w-auto px-8">Save Changes</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
