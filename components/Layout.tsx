
import React from 'react';
import { User, Role } from '../types';
import { PLATFORM_NAME } from '../constants';
import { 
  LogOut, LayoutDashboard, Users, BookOpen, 
  FileText, Settings, ShieldCheck, User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const isAdmin = user.role === Role.ADMIN;

  const adminMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches', icon: ShieldCheck },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'exams', label: 'Exams', icon: BookOpen },
    { id: 'results', label: 'Results', icon: FileText }
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'exams', label: 'Upcoming Exams', icon: BookOpen },
    { id: 'results', label: 'My Results', icon: FileText },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon }
  ];

  const currentMenu = isAdmin ? adminMenu : studentMenu;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-500 tracking-tight">{PLATFORM_NAME}</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{user.role} PANEL</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="px-4 py-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {currentMenu.find(m => m.id === activeTab)?.label || 'Overview'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Online
            </div>
          </div>
        </header>
        {children}
        
        <footer className="mt-20 py-6 text-center text-slate-600 text-xs border-t border-slate-900">
          © {PLATFORM_NAME} – Secure Exam Platform
        </footer>
      </main>
    </div>
  );
};

export default Layout;
