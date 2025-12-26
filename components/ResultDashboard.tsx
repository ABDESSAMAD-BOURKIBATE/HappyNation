import React from 'react';
import { AnalysisResult, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, Share2, Activity, Zap, Heart, AlertTriangle } from 'lucide-react';

interface ResultDashboardProps {
  result: AnalysisResult;
  user: User;
  onLogout: () => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, user, onLogout }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const scoreData = [
    { name: 'Focus', value: result.focusLevel, full: 100, fill: '#6366f1' },
    { name: 'Stress', value: result.stressLevel, full: 100, fill: result.stressLevel > 70 ? '#ef4444' : '#f59e0b' },
    { name: 'Motivation', value: result.motivationLevel, full: 100, fill: '#10b981' },
  ];

  // Mock progress data
  const progressData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 59 },
    { name: 'Week 3', score: 80 },
    { name: 'Today', score: (result.focusLevel + result.motivationLevel + (100 - result.stressLevel)) / 3 },
  ];

  const RadialCard = ({ title, value, color, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-3 opacity-10 ${color.replace('text', 'bg')}`}>
        <Icon size={64} />
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: value }, { value: 100 - value }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={50}
              startAngle={180}
              endAngle={0}
              stroke="none"
            >
              <Cell fill={value > 70 && title === 'Stress' ? '#ef4444' : (title === 'Focus' ? '#6366f1' : '#10b981')} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className={`text-2xl font-bold ${color}`}>{value}%</span>
          <span className="text-xs text-gray-400">Score</span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold mt-[-20px] ${value > 66 ? 'bg-blue-100 text-blue-700' : value > 33 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
        {value > 66 ? 'High' : value > 33 ? 'Medium' : 'Low'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-100" />
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">{user.name}</h1>
              <p className="text-xs text-gray-500">Employee Diagnostic</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-800">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Risk Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getRiskColor(result.riskLevel)} bg-opacity-20`}>
              <AlertTriangle className={result.riskLevel === 'High' ? 'text-red-600' : 'text-yellow-600'} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Analysis Completed for {user.name}</h2>
              <p className="text-gray-600 max-w-xl text-sm mt-1">{result.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold">Risk Level</p>
              <span className={`text-2xl font-bold ${result.riskLevel === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                {result.riskLevel}
              </span>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RadialCard title="Focus Level" value={result.focusLevel} color="text-indigo-600" icon={Zap} />
          <RadialCard title="Stress Level" value={result.stressLevel} color="text-red-600" icon={Activity} />
          <RadialCard title="Satisfaction" value={result.motivationLevel} color="text-green-600" icon={Heart} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
              AI Recommendations
            </h3>
            <div className="space-y-4">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Well-being Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">Overall wellness score over time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;