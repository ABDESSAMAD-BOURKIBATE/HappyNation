import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { analyzeWellBeing } from './services/gemini';
import { DraggableThemeToggle } from './components/Shared';
import { RoleSelection } from './pages/RoleSelection';
import { EmployeeLogin } from './pages/EmployeeLogin';
import { HrLogin } from './pages/HrLogin';
import { ProfileSetup } from './pages/ProfileSetup';
import { EmployeeSurvey } from './pages/EmployeeSurvey';
import { EmployeeAnalyzing } from './pages/EmployeeAnalyzing';
import { EmployeeResult } from './pages/EmployeeResult';
import { HrDashboard } from './pages/HrDashboard';
import { UserProfile, EmployeeWithAuth } from './types';
import { getEmployees, createEmployee, loginEmployee, saveAssessmentResult, getEmployeeHistory, loginAdmin, createAdmin, updateEmployee, deleteEmployee, sendFeedback, addNotification } from './services/db';

// Mock Data
const INITIAL_QUESTIONS = [
    { id: 1, text: "How often do you feel emotionally drained from your work?" },
    { id: 2, text: "Do you feel worn out at the end of the working day?" },
    { id: 3, text: "How often do you feel under pressure to meet deadlines?" },
    { id: 4, text: "I feel inspired to do my best work every day." },
    { id: 5, text: "I am enthusiastic about my job." },
    { id: 6, text: "Time flies when I'm working." },
    { id: 7, text: "I feel my contributions are recognized and valued." },
    { id: 8, text: "My work gives me a sense of personal accomplishment." },
    { id: 9, text: "I have the autonomy to decide how I do my work." },
    { id: 10, text: "I am able to disconnect from work during my personal time." },
    { id: 11, text: "I feel supported by my manager when I face challenges." },
    { id: 12, text: "I understand how my work contributes to the company's goals." },
];

export default function App() {
    const navigate = useNavigate();
    // Initialize Theme from Storage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('happynation_theme');
        return saved ? JSON.parse(saved) : false;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newState = !prev;
            localStorage.setItem('happynation_theme', JSON.stringify(newState));
            return newState;
        });
    };

    const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

    // Initialize User from Storage (Session Persistence)
    const [userProfile, setUserProfile] = useState<UserProfile | EmployeeWithAuth>(() => {
        const saved = localStorage.getItem('happynation_user');
        return saved ? JSON.parse(saved) : {
            name: '',
            role: '',
            age: '',
            image: null
        };
    });

    // Employees State
    const [employees, setEmployees] = useState<EmployeeWithAuth[]>([]);

    // Load employees on mount (for HR) & restore session
    useEffect(() => {
        const loadDocs = async () => {
            const data = await getEmployees();
            setEmployees(data);
        };
        loadDocs();

        // Seed default admin (Safe to run multiple times as it just overwrites or checks)
        createAdmin('hr@demo.com', 'pass123', 'HR Manager');

        // Restore history if user is logged in
        if (userProfile && (userProfile as any).id) {
            getEmployeeHistory((userProfile as any).id).then(h => setHistory(h));
        }

    }, []);

    const [history, setHistory] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);

    // Helpers
    const handleAddQuestion = (text: string) => {
        const newId = Math.max(...questions.map(q => q.id), 0) + 1;
        setQuestions([...questions, { id: newId, text }]);
    };

    const handleDeleteQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleAddEmployee = async (newEmp: EmployeeWithAuth) => {
        // Optimistic update
        setEmployees([...employees, newEmp]);
        await createEmployee(newEmp);
    };

    const handleUpdateEmployee = async (emp: EmployeeWithAuth) => {
        setEmployees(employees.map(e => e.id === emp.id ? emp : e));
        await updateEmployee(emp);
    };

    const handleDeleteEmployee = async (id: string) => {
        setEmployees(employees.filter(e => e.id !== id));
        await deleteEmployee(id);
    };

    const handleSendFeedback = async (id: string, message: string) => {
        await sendFeedback(id, message);
    };

    const handleEmployeeLogin = async (email: string, password?: string) => {
        const emp = await loginEmployee(email, password);

        if (emp) {
            setUserProfile(emp);
            localStorage.setItem('happynation_user', JSON.stringify(emp)); // Save Session

            // Load history from Firestore
            const historyData = await getEmployeeHistory(emp.id);
            setHistory(historyData);

            navigate('/employee-survey');
            return true;
        }
        return false;
    };

    const handleHrLogin = async (email: string, password: string) => {
        const admin = await loginAdmin(email, password);
        if (admin) {
            // We could also persist admin session here if needed, but for now focusing on employee
            navigate('/hr-dashboard');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        localStorage.removeItem('happynation_user');
        setUserProfile({ name: '', role: '', age: '', image: null });
        navigate('/');
    };

    const handleSurveyComplete = async (answers: Record<number, number>) => {
        navigate('/employee-analyzing');
        try {
            const data = await analyzeWellBeing(questions, answers, userProfile, history);
            const resultData = {
                ...data,
                date: new Date().toISOString(),
                score: data.score
            };

            setResult({
                ...data,
                font: data.risk === 'High' ? 'font-serif italic' : (data.risk === 'Medium' ? 'font-sans' : 'font-mono'),
                color: data.risk === 'High' ? 'text-red-500' : (data.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'),
                bgGlow: data.risk === 'High' ? 'shadow-red-500/20' : (data.risk === 'Medium' ? 'shadow-yellow-500/20' : 'shadow-green-500/20')
            });

            // Save result to Firestore
            if ('id' in userProfile) {
                // Cast because we know it's an EmployeeWithAuth if logged in
                await saveAssessmentResult((userProfile as any).id, resultData);
                setHistory(prev => [...prev, resultData]);
            }

            navigate('/employee-result');
        } catch (e: any) {
            console.error(e);
            const values = Object.values(answers) as number[];
            const avg = values.reduce((a, b) => a + b, 0) / questions.length;
            setResult({
                score: avg.toFixed(1),
                risk: avg < 2.5 ? 'High' : (avg < 4 ? 'Medium' : 'Low'),
                summary: `AI Error: ${e.message} `,
                recommendations: ['Check connection', 'Try again later'],
                color: avg < 2.5 ? 'text-red-500' : (avg < 4 ? 'text-yellow-500' : 'text-green-500'),
                bgGlow: 'shadow-blue-500/20',
                font: 'font-sans'
            });
            navigate('/employee-result');
        }
    };

    const handleViewHistoryResult = (historyItem: any) => {
        const risk = historyItem.risk;
        const resultData = {
            ...historyItem,
            font: risk === 'High' ? 'font-serif italic' : (risk === 'Medium' ? 'font-sans' : 'font-mono'),
            color: risk === 'High' ? 'text-red-500' : (risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'),
            bgGlow: risk === 'High' ? 'shadow-red-500/20' : (risk === 'Medium' ? 'shadow-yellow-500/20' : 'shadow-green-500/20')
        };
        setResult(resultData);
        navigate('/employee-result');
    };

    const handleProfileComplete = (profile: UserProfile) => {
        // Load history if exists
        const savedHistory = localStorage.getItem(`happynation_history_${profile.name}`);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        setUserProfile(profile);
    };

    const handleUpdateProfile = async (newProfile: UserProfile) => {
        setUserProfile(newProfile);
        localStorage.setItem(`happynation_profile`, JSON.stringify(newProfile));

        // Update in Firestore if it's an employee
        if ('id' in newProfile) {
            await updateEmployee(newProfile as EmployeeWithAuth);

            // Update local employees state to reflect changes immediately for HR Dashboard
            setEmployees(prev => prev.map(e => e.id === (newProfile as any).id ? (newProfile as EmployeeWithAuth) : e));

            await addNotification({
                type: 'PROFILE_UPDATE',
                message: `${newProfile.name} updated their profile details.`,
                date: new Date().toISOString(),
                read: false,
                employeeId: (newProfile as any).id,
                image: newProfile.image
            });
        }
    };

    // --- Theme Wrapper ---
    const bgClass = isDarkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900';

    return (
        <div className={`min-h-screen transition-colors duration-500 ${bgClass} overflow-x-hidden relative font-sans`}>
            {/* Draggable Theme Toggle Button */}
            <DraggableThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />

            {/* Dynamic Backgrounds */}
            {isDarkMode ? (
                <>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black pointer-events-none"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-700 pointer-events-none" />
                </>
            ) : (
                <>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full pointer-events-none" />
                </>
            )}

            {/* Routes */}
            <Routes>
                <Route path="/" element={<RoleSelection isDarkMode={isDarkMode} />} />
                <Route path="/role-selection" element={<RoleSelection isDarkMode={isDarkMode} />} />
                <Route path="/employee-login" element={<EmployeeLogin isDarkMode={isDarkMode} onLogin={handleEmployeeLogin} />} />
                <Route path="/hr-login" element={<HrLogin isDarkMode={isDarkMode} onLogin={handleHrLogin} />} />
                <Route path="/profile-setup" element={
                    <ProfileSetup
                        isDarkMode={isDarkMode}
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                        onProfileComplete={handleProfileComplete}
                    />
                } />
                <Route path="/employee-survey" element={
                    <EmployeeSurvey
                        isDarkMode={isDarkMode}
                        userProfile={userProfile}
                        questions={questions}
                        onComplete={handleSurveyComplete}
                        onUpdateProfile={handleUpdateProfile}
                        onViewHistoryResult={handleViewHistoryResult}
                    />
                } />
                <Route path="/employee-analyzing" element={<EmployeeAnalyzing isDarkMode={isDarkMode} />} />
                <Route path="/employee-result" element={
                    <EmployeeResult
                        isDarkMode={isDarkMode}
                        userProfile={userProfile}
                        result={result}
                        onUpdateProfile={handleUpdateProfile}
                    />
                } />
                <Route path="/hr-dashboard" element={
                    <HrDashboard
                        isDarkMode={isDarkMode}
                        questions={questions}
                        onAddQuestion={handleAddQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        employees={employees}
                        onAddEmployee={handleAddEmployee}
                        onUpdateEmployee={handleUpdateEmployee}
                        onDeleteEmployee={handleDeleteEmployee}
                        onSendFeedback={handleSendFeedback}
                    />
                } />
            </Routes>
        </div>
    );
}
