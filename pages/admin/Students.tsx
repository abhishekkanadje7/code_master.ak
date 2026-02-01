
import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { User, Batch, Role } from '../../types';
import { Plus, Trash2, Edit3, Key, Search, UserPlus, X } from 'lucide-react';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    batchId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = StorageService.getUsers();
    setStudents(allUsers.filter(u => u.role === Role.STUDENT));
    setBatches(StorageService.getBatches());
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStudent) {
      StorageService.updateUser(currentStudent.id, {
        name: formData.name,
        email: formData.email,
        batchId: formData.batchId,
        ...(formData.password ? { password: formData.password } : {})
      });
    } else {
      StorageService.addUser({
        id: `std_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: formData.password || 'student123',
        role: Role.STUDENT,
        batchId: formData.batchId,
        createdAt: Date.now()
      });
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this student? All history will be lost.")) {
      StorageService.deleteUser(id);
      loadData();
    }
  };

  const openEdit = (student: User) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      batchId: student.batchId || '',
      password: '' // Don't show existing password
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
        <button 
          onClick={() => { setCurrentStudent(null); setFormData({ name: '', email: '', password: '', batchId: '' }); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto justify-center transition-all"
        >
          <UserPlus size={20}/> Add New Student
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Student Name</th>
              <th className="px-6 py-4 font-bold">Contact Details</th>
              <th className="px-6 py-4 font-bold">Assigned Batch</th>
              <th className="px-6 py-4 font-bold">Joined Date</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-semibold">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-400">{student.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
                    {batches.find(b => b.id === student.batchId)?.name || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(student)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg">
                      <Edit3 size={18}/>
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                  <Search size={40} className="mx-auto mb-4 opacity-10" />
                  <p>No students found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h3 className="text-xl font-bold">{currentStudent ? 'Edit Student Details' : 'Onboard New Student'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Assign Batch</label>
                  <select 
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Select a Batch</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    {currentStudent ? 'Reset Password (Optional)' : 'Set Password'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!currentStudent}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-600 outline-none"
                      placeholder={currentStudent ? 'Leave blank to keep' : 'Set login password'}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20">
                  {currentStudent ? 'Update Student' : 'Onboard Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
