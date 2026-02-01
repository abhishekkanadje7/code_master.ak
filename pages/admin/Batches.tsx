
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Batch } from '../../types';
import { Plus, Trash2, Edit3, AlertCircle, X, Users } from 'lucide-react';

const BatchManagement: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteOption, setDeleteOption] = useState<'UNASSIGN_STUDENTS' | 'DELETE_STUDENTS'>('UNASSIGN_STUDENTS');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = () => {
    const b = StorageService.getBatches();
    const s = StorageService.getUsers().filter(u => u.role === 'STUDENT');
    const enriched = b.map(batch => ({
      ...batch,
      studentCount: s.filter(std => std.batchId === batch.id).length
    }));
    setBatches(enriched);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBatch) {
      StorageService.updateBatch(currentBatch.id, formData);
    } else {
      StorageService.addBatch({
        id: `batch_${Date.now()}`,
        ...formData,
        studentCount: 0
      });
    }
    setIsModalOpen(false);
    setCurrentBatch(null);
    setFormData({ name: '', description: '' });
    loadBatches();
  };

  const confirmDelete = () => {
    if (currentBatch) {
      // Check if any exam is active for this batch
      const exams = StorageService.getExams();
      const isActive = exams.some(e => e.batchId === currentBatch.id && e.status === 'ACTIVE');
      
      if (isActive) {
        alert("Cannot delete batch with an ACTIVE exam.");
        return;
      }

      StorageService.deleteBatch(currentBatch.id, deleteOption);
      setIsDeleteModalOpen(false);
      setCurrentBatch(null);
      loadBatches();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Manage Batches</h3>
        <button 
          onClick={() => { setCurrentBatch(null); setFormData({ name: '', description: '' }); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={20}/> Create New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {batches.map(batch => (
          <div key={batch.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group relative hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Users size={24}/>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCurrentBatch(batch); setFormData({ name: batch.name, description: batch.description }); setIsModalOpen(true); }}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <Edit3 size={18}/>
                </button>
                <button 
                  onClick={() => { setCurrentBatch(batch); setIsDeleteModalOpen(true); }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
            <h4 className="text-xl font-bold mb-1">{batch.name}</h4>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2">{batch.description || 'No description provided.'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Registered Students</span>
              <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-xs font-bold">{batch.studentCount} Students</span>
            </div>
          </div>
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <Users size={40} className="mb-4 opacity-20"/>
            <p>No batches found. Start by creating your first batch.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{currentBatch ? 'Edit Batch' : 'Create New Batch'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Batch Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5"
                  placeholder="e.g. Batch Alpha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 h-24"
                  placeholder="What is this batch about?"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 py-3 rounded-xl font-bold mt-4 hover:bg-indigo-700">
                {currentBatch ? 'Save Changes' : 'Create Batch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32}/>
            </div>
            <h3 className="text-2xl font-bold mb-2">Delete Batch?</h3>
            <p className="text-slate-400 mb-8">This action will remove <strong>{currentBatch?.name}</strong>. Please choose how to handle associated students.</p>
            
            <div className="space-y-3 mb-8">
              <button 
                onClick={() => setDeleteOption('UNASSIGN_STUDENTS')}
                className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${deleteOption === 'UNASSIGN_STUDENTS' ? 'bg-indigo-600/10 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}
              >
                <div>
                  <p className="font-bold">Unassign Students</p>
                  <p className="text-xs text-slate-500">Keep students but remove their batch association.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${deleteOption === 'UNASSIGN_STUDENTS' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'}`}/>
              </button>
              <button 
                onClick={() => setDeleteOption('DELETE_STUDENTS')}
                className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${deleteOption === 'DELETE_STUDENTS' ? 'bg-red-900/10 border-red-500' : 'bg-slate-950 border-slate-800'}`}
              >
                <div>
                  <p className="font-bold text-red-400">Delete Students</p>
                  <p className="text-xs text-slate-500">Permenantly remove all students in this batch.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${deleteOption === 'DELETE_STUDENTS' ? 'border-red-500 bg-red-500' : 'border-slate-700'}`}/>
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
