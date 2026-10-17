
import React, { useState } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../services/storage';
import { PLATFORM_NAME } from '../constants';
import { ShieldCheck, Lock, User as UserIcon, AlertCircle, CheckCircle, FileText, GraduationCap, Timer } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center px-6 pb-16 pt-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <header className="w-full max-w-6xl flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/70 font-semibold">Exam Conducting Platform</p>
          <h1 className="text-2xl font-extrabold text-white mt-2">{PLATFORM_NAME}</h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
          <span className="flex items-center gap-2"><ShieldCheck size={16}/> Compliance-ready</span>
          <span className="flex items-center gap-2"><Timer size={16}/> Real-time proctoring</span>
        </div>
      </header>

      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center mt-12">
        <section className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Create, conduct, and evaluate exams with confidence.
            </h2>
            <p className="text-lg text-slate-400 max-w-xl">
              Launch secure assessments in minutes with automated scheduling, smart proctoring, and detailed analytics for every learner cohort.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-indigo-400" /> Role-based access</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-indigo-400" /> Timed, randomized exams</span>
              <span className="flex items-center gap-2"><CheckCircle size={16} className="text-indigo-400" /> Instant grading</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-white font-semibold">
                <FileText size={18} className="text-indigo-400" />
                Build Exam Blueprints
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Organize question banks, apply difficulty weights, and publish multi-section tests.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-white font-semibold">
                <GraduationCap size={18} className="text-indigo-400" />
                Monitor Cohorts
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Track attendance, violations, and performance across batches in real time.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold">How exam conducting works</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3"><CheckCircle size={16} className="text-indigo-400 mt-0.5" /> Create batches, import students, and assign supervisors.</li>
              <li className="flex items-start gap-3"><CheckCircle size={16} className="text-indigo-400 mt-0.5" /> Schedule exams with proctoring rules, time limits, and adaptive sections.</li>
              <li className="flex items-start gap-3"><CheckCircle size={16} className="text-indigo-400 mt-0.5" /> Release results with analytics, insights, and remediation plans.</li>
            </ul>
          </div>
        </section>

        <section className="w-full">
          <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Access the Exam Console</h3>
              <p className="text-sm text-slate-400 mt-2">Sign in to manage or take scheduled assessments.</p>
            </div>
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
        </section>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
        <div className="flex items-center gap-2"><ShieldCheck size={16}/> 256-bit AES</div>
        <div className="flex items-center gap-2"><Lock size={16}/> Trusted System</div>
        <div className="flex items-center gap-2"><CheckCircle size={16}/> ISO aligned workflows</div>
      </div>
    </div>
  );
};

export default LoginPage;
