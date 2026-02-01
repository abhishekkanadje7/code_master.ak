
import React, { useMemo } from 'react';
import { User, Exam, Submission } from '../../types';
import { StorageService } from '../../services/storage';
import { PdfGenerator } from '../../services/pdfGenerator';
import { Download, Award, FileCheck, ShieldAlert, Clock } from 'lucide-react';

const StudentResults: React.FC<{ user: User }> = ({ user }) => {
  const allExams = useMemo(() => StorageService.getExams(), []);
  const mySubmissions = useMemo(() => StorageService.getSubmissions().filter(s => s.studentId === user.id), [user.id]);
  const batches = useMemo(() => StorageService.getBatches(), []);
  const myBatch = useMemo(() => batches.find(b => b.id === user.batchId), [batches, user.batchId]);

  const handleDownload = (sub: Submission, exam: Exam) => {
    if (myBatch) {
      PdfGenerator.generateStudentReport(user, exam, sub, myBatch);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Your Achievements</h3>
            <p className="text-xs text-slate-500">Consolidated list of your examination results.</p>
          </div>
          <Award size={32} className="text-indigo-500 opacity-50" />
        </div>

        <div className="divide-y divide-slate-800">
          {mySubmissions.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500">
              <FileCheck size={64} className="mb-4 opacity-10" />
              <p className="text-lg font-bold">No results found.</p>
              <p className="text-sm">Your results will appear here once you complete an exam.</p>
            </div>
          ) : (
            mySubmissions.reverse().map(sub => {
              const exam = allExams.find(e => e.id === sub.examId);
              const isPass = exam ? sub.score >= exam.totalMarks * 0.4 : false;
              
              return (
                <div key={sub.id} className="p-8 hover:bg-slate-800/20 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-2xl font-black group-hover:text-indigo-400 transition-colors">{exam?.name || 'Deleted Exam'}</h4>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={12}/> Completed {new Date(sub.endTime).toLocaleDateString()}</span>
                        <span className={`flex items-center gap-1 ${sub.warningsCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          <ShieldAlert size={12}/> {sub.warningsCount} Warnings Used
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="text-center">
                        <p className={`text-4xl font-black ${isPass ? 'text-emerald-500' : 'text-red-500'}`}>
                          {sub.score}<span className="text-lg text-slate-600 font-medium"> / {exam?.totalMarks}</span>
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPass ? 'Success Status: PASS' : 'Success Status: FAIL'}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => exam && handleDownload(sub, exam)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95"
                        title="Download Performance Certificate"
                      >
                        <Download size={24}/>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
