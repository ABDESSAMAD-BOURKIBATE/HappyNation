import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
    const baseStyle = "px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 active:scale-95";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-blue-500/40 hover:brightness-110",
        secondary: "bg-slate-800 text-white dark:bg-slate-800 dark:border-slate-700 bg-white border-slate-200 text-slate-900 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 w-full md:w-auto",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        ghost: "bg-transparent text-slate-400 hover:text-white dark:hover:text-white hover:text-slate-900"
    };
    // @ts-ignore
    const variantClass = variants[variant] || variants.primary;
    return (
        <button onClick={onClick} className={`${baseStyle} ${variantClass} ${className} `} {...props}>
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', onClick, isDark, noHover }: any) => (
    <div onClick={onClick} className={`${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/80 border-white/60'} backdrop-blur-xl border rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0, 0, 0, 0.04)] transition-all duration-500 ${!noHover && 'hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2'} ${className} `}>
        {children}
    </div>
);

export const CircularGauge = ({ value, label, color, icon, bgClass, isDark }: any) => {
    // Semi-circle gauge (180 degrees)
    const radius = 35;
    // const circumference = Math.PI * radius; 

    // SVG calc:
    // r=35. 
    // DashArray: "110 220" (Stroke 110, Gap 220 to be safe)

    const fullCircumference = 2 * Math.PI * radius;
    const halfCircumference = fullCircumference / 2;

    // Value is 0-100.
    // We want the colored bar to be length = (value/100) * halfCircumference
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const strokeLength = (value / 100) * halfCircumference;

    return (
        <Card isDark={isDark} className="flex flex-col items-center justify-between !p-6 h-full min-h-[220px]">
            <div className="w-full flex justify-between items-start mb-4">
                <h3 className={`text-[11px] font-bold uppercase tracking-[0.2em] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-700'} `}>{label}</h3>
                <div className={`p-3 rounded-xl ${bgClass} ${color.replace('text-', 'text-')} `}>
                    {icon}
                </div>
            </div>

            <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center mb-4">
                {/* Simpler SVG Approach: ViewBox 0 0 100 54 */}
                <svg viewBox="0 0 100 54" className="w-full h-full">
                    {/* Track Background */}
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="8" strokeLinecap="round" />

                    {/* Value Indicator */}
                    {/* Calculate path length for DashArray. Arch length approx PI*40 = 125.6 */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 * (1 - value / 100)}
                        className={`${color} transition-all duration-1000 ease-out drop-shadow-md`}
                    />
                </svg>

                <div className="absolute bottom-0 text-center mb-0">
                    <span className={`text-3xl font-black block leading-none ${color} drop-shadow-sm`}>{value}%</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'} `}>Score</span>
                </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${value >= 70 ? 'bg-emerald-100/80 text-emerald-600' : value >= 40 ? 'bg-yellow-100/80 text-yellow-600' : 'bg-red-100/80 text-red-600'} `}>
                {value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low'}
            </div>
        </Card>
    );
};

export const BriefcaseIcon = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);

export const NavItem = ({ children, icon, active, isDark, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${active ? 'bg-blue-600 shadow-lg shadow-blue-500/30 text-white' : (isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')} `}>
        {icon}
        <span className="font-bold tracking-wide group-hover:translate-x-1 transition-transform">{children}</span>
    </div>
);

export const SurveyOption = ({ label, score, onClick, isDark }: any) => {
    return (
        <button onClick={() => onClick(score)} className={`w-full p-6 rounded-[2rem] border transition-all duration-300 text-left flex justify-between items-center group shadow-sm hover: shadow-lg hover: border-blue-500 hover: scale-105 ${isDark ? 'border-slate-800 bg-slate-900/50 hover:bg-blue-600/10' : 'border-slate-200 bg-white hover:bg-blue-50'} `}>
            <span className={`font-bold text-xl group-hover: tracking-wide transition-all ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-blue-900'} `}>{label}</span>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isDark ? 'border-slate-700 group-hover:border-blue-500' : 'border-slate-200 group-hover:border-blue-500'} `}>
                <div className="w-4 h-4 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100" />
            </div>
        </button>
    );
};

export const DraggableThemeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => {
    const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 80 : 20, y: 24 });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState({ x: 0, y: 0 }); // Offset within the button
    const [hasMoved, setHasMoved] = useState(false);

    // Initial positioning to safely get window dimensions on mount
    useEffect(() => {
        setPos({ x: window.innerWidth - 90, y: 30 });
    }, []);

    const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setDragging(true);
        setHasMoved(false);
        setRel({
            x: clientX - pos.x,
            y: clientY - pos.y
        });
        e.stopPropagation();
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

            // Boundary constraints 
            const newX = Math.max(10, Math.min(window.innerWidth - 60, clientX - rel.x));
            const newY = Math.max(10, Math.min(window.innerHeight - 60, clientY - rel.y));

            setPos({ x: newX, y: newY });
            setHasMoved(true);
        };

        const handleUp = () => {
            setDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [dragging, rel]);

    const handleClick = () => {
        if (!hasMoved) {
            onToggle();
        }
    };

    if (pos.x === 0 && pos.y === 0) return null; // Wait for mount init

    return (
        <div
            className={`fixed z-[9999] rounded-full shadow-2xl cursor-grab active:cursor-grabbing p-4 transition-transform hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-800 text-yellow-400 shadow-yellow-900/20 border border-slate-700' : 'bg-white text-slate-900 shadow-slate-300 border border-slate-100'
                }`}
            style={{
                left: pos.x,
                top: pos.y,
                touchAction: 'none'
            }}
            onMouseDown={handleDown}
            onTouchStart={handleDown}
            onClick={handleClick}
        >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </div>
    );
};
