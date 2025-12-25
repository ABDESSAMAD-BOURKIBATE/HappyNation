import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Card } from '../components/Shared';
import { uploadToCloudinary } from '../services/utils';
import { UserProfile } from '../types';

interface ProfileSetupProps {
    isDarkMode: boolean;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    onProfileComplete: (profile: UserProfile) => void;
}

export const ProfileSetup = ({ isDarkMode, userProfile, setUserProfile, onProfileComplete }: ProfileSetupProps) => {
    const navigate = useNavigate();
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const [isUploading, setIsUploading] = useState(false);

    const handleProfileSubmit = async () => {
        // Logic from App.tsx handleProfileSubmit
        // We'll call onProfileComplete which will handle persistence in App.tsx
        onProfileComplete(userProfile);
        navigate('/employee-survey');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-6">
            <Card isDark={isDarkMode} className="w-full max-w-lg !p-10 relative overflow-hidden group">
                <button onClick={() => navigate('/role-selection')} className={`absolute top-8 left-8 flex items-center gap-2 text-sm font-bold ${textMuted} hover:text-blue-500 transition-colors`}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="mt-8 mb-8 text-center">
                    <h2 className="text-3xl font-black mb-2">Create Profile</h2>
                    <p className={`${textMuted}`}>Help our AI personalize your well-being analysis.</p>
                </div>

                <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:scale-105 ${userProfile.image ? 'border-transparent' : 'border-slate-300 hover:border-blue-500'}`}>
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
                                        if (url) setUserProfile(prev => ({ ...prev, image: url }));
                                    }
                                }}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center animate-pulse">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : userProfile.image ? (
                                <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-2">
                                    <div className="bg-slate-100 rounded-full p-2 mb-1 mx-auto w-fit"><User size={16} className="text-slate-400" /></div>
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
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                placeholder="e.g. Alex Murphy"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Role / Title</label>
                            <input
                                type="text"
                                value={userProfile.role}
                                onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                                className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                placeholder="Designer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Age</label>
                            <input
                                type="number"
                                value={userProfile.age}
                                onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
                                className={`w-full p-4 rounded-xl border bg-transparent outline-none font-bold transition-all focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                                placeholder="28"
                            />
                        </div>
                    </div>

                    <Button
                        className="w-full mt-4 shadow-xl shadow-blue-500/20"
                        onClick={handleProfileSubmit}
                        disabled={!userProfile.name}
                    >
                        Start Assessment <ArrowRight className="ml-2" size={18} />
                    </Button>
                </div>
            </Card>
        </div>
    );
};
