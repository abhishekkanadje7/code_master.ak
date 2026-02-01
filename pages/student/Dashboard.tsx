
import React, { useMemo } from 'react';
import { User, Exam, Submission } from '../../types';
import { StorageService } from '../../services/storage';
import { BookOpen, CheckCircle, TrendingUp, Award, Clock } from 'lucide-react';
import DashboardStats from '../../components/DashboardStats';

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const allExams = useMemo(() => StorageService.getExams(), []);
  const mySubmissions = useMemo(() => StorageService.getSubmissions().filter(s => s.studentId === user.id), [user.id]);
  
  const myExams = useMemo(() => 
    allExams.filter(e => e.batchId === user.batchId), 
    [allExams, user.batchId]
  );

  const activeExams = myExams.filter(e => e.status === 'ACTIVE' && !mySubmissions.find(s => s.examId === e.id));
  const upcomingExams = myExams.filter(e => e.status === 'UPCOMING');

  const stats = [
    { label: 'Assigned Exams', value: myExams.length, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Completed', value: mySubmissions.length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Active Now', value: activeExams.length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Avg Accuracy', value: mySubmissions.length ? `${(mySubmissions.reduce((acc, curr) => acc + curr.score, 0) / mySubmissions.length).toFixed(1)}%` : '0%', icon: Award, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-white mb-2">Hello, {user.name}!</h3>
          <p className="text-indigo-200 opacity-80 max-w-md">You have {activeExams.length} active exams waiting for you. Good luck with your preparations.</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={160} />
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400"/> Recent Submissions
          </h4>
          <div className="space-y-4">
            {mySubmissions.slice(-4).reverse().map(sub => {
              const exam = allExams.find(e => e.id === sub.examId);
              return (
                <div key={sub.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div>
                    <p className="font-semibold text-sm">{exam?.name || 'Unknown Exam'}</p>
                    <p className="text-xs text-slate-500">{new Date(sub.endTime).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-400">{sub.score} / {exam?.totalMarks}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-600">Marks Obtained</p>
                  </div>
                </div>
              );
            })}
            {mySubmissions.length === 0 && (
              <p className="text-center py-10 text-slate-500 text-sm italic">You haven't completed any exams yet.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock size={18} className="text-amber-400"/> Upcoming Schedule
          </h4>
          <div className="space-y-4">
            {upcomingExams.slice(0, 4).map(exam => (
              <div key={exam.id} className="flex gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 items-center">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20 shrink-0">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{new Date(exam.startTime).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-black leading-none">{new Date(exam.startTime).getDate()}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{exam.name}</p>
                  <p className="text-xs text-slate-500">{new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded-md uppercase font-bold">Upcoming</span>
                </div>
              </div>
            ))}
            {upcomingExams.length === 0 && (
              <p className="text-center py-10 text-slate-500 text-sm italic">No upcoming exams scheduled for your batch.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
