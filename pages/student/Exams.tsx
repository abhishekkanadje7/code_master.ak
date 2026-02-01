
import React, { useMemo } from 'react';
import { User, Exam } from '../../types';
import { StorageService } from '../../services/storage';
import { PlayCircle, Clock, Info, ShieldCheck } from 'lucide-react';

interface StudentExamsProps {
  user: User;
  onStartExam: (exam: Exam) => void;
}

const StudentExams: React.FC<StudentExamsProps> = ({ user, onStartExam }) => {
  const allExams = useMemo(() => StorageService.getExams(), []);
  const submissions = useMemo(() => StorageService.getSubmissions().filter(s => s.studentId === user.id), [user.id]);
  
  const myExams = useMemo(() => 
    allExams.filter(e => e.batchId === user.batchId), 
    [allExams, user.batchId]
  );

  const activeExams = myExams.filter(e => e.status === 'ACTIVE');
  const upcomingExams = myExams.filter(e => e.status === 'UPCOMING');
  const completedExams = myExams.filter(e => e.status === 'COMPLETED');

  // Fix: Explicitly define ExamCard as a React.FC to allow React's internal 'key' attribute when mapping
  const ExamCard: React.FC<{ exam: Exam }> = ({ exam }) => {
    const isCompleted = submissions.some(s => s.examId === exam.id);
    const canStart = exam.status === 'ACTIVE' && !isCompleted;

    return (
      <div className={`bg-slate-900 border rounded-2xl p-6 transition-all ${canStart ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-slate-800'}`}>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase ${
            exam.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
            exam.status === 'UPCOMING' ? 'bg-indigo-500/10 text-indigo-500' :
            'bg-slate-800 text-slate-500'
          }`}>
            {isCompleted ? 'ATTEMPTED' : exam.status}
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock size={14}/>
            <span className="text-xs font-bold">{exam.durationMinutes}m</span>
          </div>
        </div>
        
        <h4 className="text-xl font-bold mb-4">{exam.name}</h4>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Questions</span>
            <span className="text-white font-bold">{exam.questions.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Marks</span>
            <span className="text-white font-bold">{exam.totalMarks}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Closes At</span>
            <span className="text-white font-bold">{new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {canStart ? (
          <button 
            onClick={() => onStartExam(exam)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-900/20"
          >
            <PlayCircle size={20} className="group-hover:scale-110 transition-transform" /> Start Examination
          </button>
        ) : (
          <div className="w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700">
            {isCompleted ? 'Already Attempted' : exam.status === 'UPCOMING' ? 'Opening Soon' : 'Closed'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <div className="bg-amber-950/20 border border-amber-900/50 p-6 rounded-2xl flex items-start gap-4">
        <ShieldCheck className="text-amber-500 shrink-0" size={24}/>
        <div className="space-y-1">
          <p className="font-bold text-amber-500">Secure Protocol Active</p>
          <p className="text-xs text-slate-400">All examinations are monitored. Fullscreen exit or tab switching will lead to automatic disqualification after 3 warnings. Ensure a stable internet connection before starting.</p>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"/> Available Now
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeExams.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          {activeExams.length === 0 && (
            <div className="col-span-full py-16 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
              <Info size={32} className="mb-2 opacity-20"/>
              <p>No active examinations currently available for your batch.</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <div className="w-2 h-8 bg-indigo-500 rounded-full"/> Upcoming Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingExams.map(exam => <ExamCard key={exam.id} exam={exam} />)}
          {upcomingExams.length === 0 && (
            <p className="col-span-full text-slate-500 text-sm italic">No exams scheduled for the future.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <div className="w-2 h-8 bg-slate-700 rounded-full"/> Recently Closed
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          {completedExams.map(exam => <ExamCard key={exam.id} exam={exam} />)}
        </div>
      </section>
    </div>
  );
};

export default StudentExams;
