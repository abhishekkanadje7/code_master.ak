
import React, { useState } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../services/storage';
import { PLATFORM_NAME } from '../constants';
import { ShieldCheck, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      if (isAdminMode && user.role !== Role.ADMIN) {
        setError('Unauthorized access.');
        return;
      }
      onLogin(user);
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-200 tracking-tighter">
          {PLATFORM_NAME}
        </h1>
        <p className="text-slate-500 mt-2 font-medium tracking-wide">Enterprise Examination Suite</p>
      </div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
        <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setIsAdminMode(false); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isAdminMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            Student Login
          </button>
          <button 
            onClick={() => { setIsAdminMode(true); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isAdminMode ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            Admin Panel
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
          >
            {isAdminMode ? 'Authorize Admin Access' : 'Sign In To Exam Portal'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-600 text-xs">
          Forgot credentials? Contact system administrator.
        </p>
      </div>

      <div className="mt-12 flex items-center gap-8 opacity-40">
        <div className="flex items-center gap-2"><ShieldCheck size={16}/> 256-bit AES</div>
        <div className="flex items-center gap-2"><Lock size={16}/> Trusted System</div>
      </div>
    </div>
  );
};

export default LoginPage;
