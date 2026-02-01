
import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { Exam, Batch, Question } from '../../types';
import { Plus, Trash2, Edit3, Calendar, Clock, BookOpen, X, Image as ImageIcon, PlusCircle } from 'lucide-react';

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    batchId: '',
    durationMinutes: 60,
    totalMarks: 100,
    startTime: '',
    endTime: '',
    questions: [] as Question[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExams(StorageService.getExams());
    setBatches(StorageService.getBatches());
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${formData.questions.length}`,
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      imageUrl: ''
    };
    setFormData({ ...formData, questions: [...formData.questions, newQuestion] });
  };

  const handleQuestionChange = (index: number, updates: Partial<Question>) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], ...updates };
    setFormData({ ...formData, questions: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const examData: Exam = {
      id: currentExam?.id || `exam_${Date.now()}`,
      name: formData.name,
      batchId: formData.batchId,
      durationMinutes: formData.durationMinutes,
      totalMarks: formData.totalMarks,
      startTime: new Date(formData.startTime).getTime(),
      endTime: new Date(formData.endTime).getTime(),
      questions: formData.questions,
      status: 'UPCOMING'
    };

    if (currentExam) {
      StorageService.updateExam(currentExam.id, examData);
    } else {
      StorageService.addExam(examData);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (exam: Exam) => {
    if (exam.status === 'ACTIVE') {
      alert("Cannot delete an ACTIVE exam.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this exam?")) {
      StorageService.deleteExam(exam.id);
      loadData();
    }
  };

  const openModal = (exam: Exam | null) => {
    if (exam) {
      setCurrentExam(exam);
      setFormData({
        name: exam.name,
        batchId: exam.batchId,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        startTime: new Date(exam.startTime).toISOString().slice(0, 16),
        endTime: new Date(exam.endTime).toISOString().slice(0, 16),
        questions: exam.questions
      });
    } else {
      setCurrentExam(null);
      setFormData({
        name: '',
        batchId: '',
        durationMinutes: 60,
        totalMarks: 100,
        startTime: '',
        endTime: '',
        questions: []
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Examination Schedule</h3>
        <button 
          onClick={() => openModal(null)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
        >
          <Plus size={20}/> Create New Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-widest uppercase ${
                exam.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                exam.status === 'UPCOMING' ? 'bg-indigo-500/10 text-indigo-500' :
                'bg-slate-800 text-slate-500'
              }`}>
                {exam.status}
              </span>
              <div className="flex gap-2">
                <button onClick={() => openModal(exam)} className="p-1.5 text-slate-500 hover:text-white"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(exam)} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            </div>
            <h4 className="text-lg font-bold mb-4">{exam.name}</h4>
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar size={14}/> {new Date(exam.startTime).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock size={14}/> {new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <BookOpen size={14}/> Batch: {batches.find(b => b.id === exam.batchId)?.name || 'N/A'}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">{exam.questions.length} Questions</span>
              <span className="text-sm font-bold text-indigo-400">{exam.totalMarks} Marks</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h3 className="text-2xl font-bold">{currentExam ? 'Edit Examination' : 'Compose New Exam'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={28}/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Exam Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      placeholder="e.g. Final Semester 2024"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Target Batch</label>
                      <select 
                        value={formData.batchId}
                        onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      >
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Total Marks</label>
                      <input 
                        type="number" 
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Start Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">End Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Question Creator */}
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h4 className="text-xl font-bold text-indigo-400">Question Paper ({formData.questions.length})</h4>
                  <button 
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-indigo-600/10 text-indigo-500 border border-indigo-600/30 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold"
                  >
                    <PlusCircle size={18}/> Add Question
                  </button>
                </div>

                <div className="space-y-12">
                  {formData.questions.map((q, qIdx) => (
                    <div key={q.id} className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl space-y-6 relative">
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== qIdx) })}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 size={20}/>
                      </button>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                          {qIdx + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <textarea 
                            value={q.text}
                            onChange={(e) => handleQuestionChange(qIdx, { text: e.target.value })}
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 min-h-[80px]"
                            placeholder="Type your question here..."
                          />
                          <div className="flex items-center gap-3">
                            <ImageIcon size={18} className="text-slate-500"/>
                            <input 
                              type="text"
                              value={q.imageUrl || ''}
                              onChange={(e) => handleQuestionChange(qIdx, { imageUrl: e.target.value })}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm"
                              placeholder="Image URL (optional)"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={`correct_${q.id}`}
                              checked={q.correctOptionIndex === oIdx}
                              onChange={() => handleQuestionChange(qIdx, { correctOptionIndex: oIdx })}
                              className="w-5 h-5 accent-indigo-600"
                            />
                            <input 
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[oIdx] = e.target.value;
                                handleQuestionChange(qIdx, { options: newOpts });
                              }}
                              required
                              className={`flex-1 bg-slate-950 border rounded-xl px-4 py-2 text-sm ${q.correctOptionIndex === oIdx ? 'border-indigo-600/50' : 'border-slate-800'}`}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 sticky bottom-0 bg-slate-900/80 backdrop-blur-md pt-6 pb-2 border-t border-slate-800 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold shadow-xl shadow-indigo-900/30"
                >
                  {currentExam ? 'Update Examination' : 'Publish Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
