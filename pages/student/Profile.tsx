
import React, { useState } from 'react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import { User as UserIcon, Mail, Lock, ShieldCheck, Save, AlertCircle } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateUser(user.id, { name: formData.name, email: formData.email });
    const updatedUser = { ...user, ...formData };
    onUpdate(updatedUser);
    localStorage.setItem('cm_active_user', JSON.stringify(updatedUser));
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we'd check against stored user.password
    // Here we find the latest data from StorageService
    const latestUser = StorageService.getUsers().find(u => u.id === user.id);
    
    if (passwordData.oldPassword !== latestUser?.password) {
      setMessage({ type: 'error', text: 'Incorrect old password.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    StorageService.updateUser(user.id, { password: passwordData.newPassword });
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setMessage({ type: 'success', text: 'Password changed successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
        }`}>
          <AlertCircle size={18}/>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
              <UserIcon size={24}/>
            </div>
            <div>
              <h4 className="text-xl font-bold">Personal Identity</h4>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Public Information</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Legal Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              <Save size={18}/> Save Profile Details
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <ShieldCheck size={24}/>
            </div>
            <div>
              <h4 className="text-xl font-bold">Access Security</h4>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Authentication Key</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Existing Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                <input 
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                  placeholder="Enter current password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">New Strong Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18}/>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
              Update Authentication Key
            </button>
          </form>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-bold">Session Activity</h4>
          <p className="text-sm text-slate-500">Last login: {new Date().toLocaleDateString()} from {window.navigator.platform}</p>
        </div>
        <div className="bg-slate-800 px-6 py-2 rounded-full text-xs font-bold text-emerald-400 border border-emerald-900/30">
          Account Status: SECURED
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
