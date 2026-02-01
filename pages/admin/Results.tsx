
import React, { useState, useMemo } from 'react';
import { StorageService } from '../../services/storage';
import { PdfGenerator } from '../../services/pdfGenerator';
import { Exam, Submission, User, Batch } from '../../types';
import { Download, FileText, Filter, Search, Award, TrendingUp, AlertCircle } from 'lucide-react';

const AdminResults: React.FC = () => {
  const exams = useMemo(() => StorageService.getExams().filter(e => e.status === 'COMPLETED'), []);
  const submissions = useMemo(() => StorageService.getSubmissions(), []);
  const students = useMemo(() => StorageService.getUsers().filter(u => u.role === 'STUDENT'), []);
  const batches = useMemo(() => StorageService.getBatches(), []);

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);
  
  const examSubmissions = useMemo(() => {
    return submissions.filter(s => s.examId === selectedExamId);
  }, [submissions, selectedExamId]);

  const stats = useMemo(() => {
    if (examSubmissions.length === 0) return null;
    const scores = examSubmissions.map(s => s.score);
    const totalPossible = activeExam?.totalMarks || 100;
    const passCount = examSubmissions.filter(s => s.score >= totalPossible * 0.4).length;

    return {
      appeared: examSubmissions.length,
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passRate: ((passCount / examSubmissions.length) * 100).toFixed(1),
      failCount: examSubmissions.length - passCount
    };
  }, [examSubmissions, activeExam]);

  const filteredSubmissions = useMemo(() => {
    return examSubmissions.filter(sub => {
      const student = students.find(s => s.id === sub.studentId);
      return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [examSubmissions, students, searchQuery]);

  const handleDownload = (sub: Submission) => {
    const student = students.find(s => s.id === sub.studentId);
    const batch = batches.find(b => b.id === student?.batchId);
    if (student && activeExam && batch) {
      PdfGenerator.generateStudentReport(student, activeExam, sub, batch);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Performance Analytics</h3>
          <p className="text-sm text-slate-500">Detailed insights into completed examinations.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
            <select 
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              {exams.length === 0 && <option>No Completed Exams</option>}
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
            <input 
              type="text" 
              placeholder="Filter by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
        </div>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Appeared" value={stats.appeared} icon={TrendingUp} color="text-indigo-400" />
            <StatCard label="Avg Score" value={stats.avg} icon={Award} color="text-emerald-400" />
            <StatCard label="Highest" value={stats.highest} icon={Award} color="text-amber-400" />
            <StatCard label="Lowest" value={stats.lowest} icon={Award} color="text-red-400" />
            <StatCard label="Pass Rate" value={`${stats.passRate}%`} icon={Award} color="text-emerald-400" />
            <StatCard label="Failures" value={stats.failCount} icon={AlertCircle} color="text-red-500" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-bold">Student Identity</th>
                  <th className="px-6 py-4 font-bold">Score Achievement</th>
                  <th className="px-6 py-4 font-bold">Security Log</th>
                  <th className="px-6 py-4 font-bold text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredSubmissions.map(sub => {
                  const student = students.find(s => s.id === sub.studentId);
                  const isPass = sub.score >= (activeExam?.totalMarks || 100) * 0.4;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold">{student?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{student?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-black ${isPass ? 'text-emerald-500' : 'text-red-500'}`}>
                            {sub.score}
                          </span>
                          <span className="text-slate-600">/ {activeExam?.totalMarks}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${isPass ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className={`text-xs flex items-center gap-1 ${sub.warningsCount > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                            <AlertCircle size={10}/> {sub.warningsCount} Warnings
                          </p>
                          {sub.isAutoSubmitted && (
                            <p className="text-[10px] text-red-400 font-bold uppercase italic tracking-tighter">Auto-Terminated</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDownload(sub)}
                          className="p-2 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all"
                        >
                          <Download size={18}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl border-dashed">
          <FileText size={48} className="mb-4 opacity-10" />
          <p className="text-lg font-medium">No results generated for this exam yet.</p>
          <p className="text-sm">Wait for students to complete their submissions.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
    <div className={`p-2 rounded-lg bg-slate-800 ${color}`}><Icon size={18}/></div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

export default AdminResults;
