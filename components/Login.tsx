import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-indigo-600 p-4 rounded-full">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Happynation</h1>
        <p className="text-gray-500 mb-8">Employee Well-Being AI Evaluation</p>

        <div className="space-y-4">
          <button
            onClick={() => onLogin(UserRole.EMPLOYEE)}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-600 transition-all duration-200 group"
          >
            <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200">
              <UserIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Employee Login</p>
              <p className="text-sm text-gray-500">Take the wellness survey</p>
            </div>
          </button>

          <button
            onClick={() => onLogin(UserRole.ADMIN)}
            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-600 transition-all duration-200 group"
          >
            <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Admin Dashboard</p>
              <p className="text-sm text-gray-500">View company analytics</p>
            </div>
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Powered by Gemini AI • Secure & Anonymous
        </p>
      </div>
    </div>
  );
};

export default Login;