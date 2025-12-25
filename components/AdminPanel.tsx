import React from 'react';
import { User } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, TrendingDown, AlertCircle, FileText } from 'lucide-react';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  // Mock aggregated data
  const deptData = [
    { name: 'Eng', stress: 75, focus: 60 },
    { name: 'Sales', stress: 80, focus: 50 },
    { name: 'HR', stress: 40, focus: 85 },
    { name: 'Marketing', stress: 55, focus: 70 },
  ];

  const trendData = [
    { name: 'Mon', risk: 12 },
    { name: 'Tue', risk: 15 },
    { name: 'Wed', risk: 10 },
    { name: 'Thu', risk: 18 },
    { name: 'Fri', risk: 25 }, // Burnout usually higher on Fridays in mock data
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar / Header hybrid for Admin */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Happynation <span className="text-slate-400 font-normal">| HR Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-300">Welcome, {user.name}</span>
             <button onClick={onLogout} className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500">Total Responses</p>
                <h3 className="text-3xl font-bold text-slate-800">124</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
            </div>
            <span className="text-xs text-green-600 font-medium">+12% from last week</span>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500">Avg Stress Level</p>
                <h3 className="text-3xl font-bold text-slate-800">62%</h3>
              </div>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
            </div>
            <span className="text-xs text-red-500 font-medium">↑ 5% higher than industry avg</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500">High Risk Employees</p>
                <h3 className="text-3xl font-bold text-slate-800">8</h3>
              </div>
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><AlertCircle size={20} /></div>
            </div>
            <span className="text-xs text-slate-400">Action required</span>
          </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-slate-500">Avg Engagement</p>
                <h3 className="text-3xl font-bold text-slate-800">78%</h3>
              </div>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20} /></div>
            </div>
            <span className="text-xs text-green-600 font-medium">Stable</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">Department Stress vs Focus</h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={deptData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="stress" fill="#ef4444" name="Stress" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="focus" fill="#6366f1" name="Focus" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">High Risk Incidents (Weekly)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Admin Tools Table Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Survey Management</h3>
            <button className="text-sm text-indigo-600 font-medium hover:underline">Manage Questions</button>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="p-4">Question ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Active</th>
                <th className="p-4">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="p-4">Q-001</td>
                <td className="p-4"><span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">Stress</span></td>
                <td className="p-4"><span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>Yes</td>
                <td className="p-4">3.4/5</td>
              </tr>
              <tr className="border-b border-slate-50">
                 <td className="p-4">Q-002</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Focus</span></td>
                <td className="p-4"><span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>Yes</td>
                <td className="p-4">4.1/5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;