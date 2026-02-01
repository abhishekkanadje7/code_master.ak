
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Exam, Submission, Question, User } from '../types';
import { WARNING_LIMIT, PLATFORM_NAME } from '../constants';
import { Timer, AlertTriangle, ChevronRight, ChevronLeft, Send, Expand } from 'lucide-react';

interface ExamRoomProps {
  exam: Exam;
  student: User;
  onComplete: (submission: Submission) => void;
}

const ExamRoom: React.FC<ExamRoomProps> = ({ exam, student, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(exam.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [warnings, setWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [startTime] = useState(Date.now());
  // Fix: Use any instead of NodeJS.Timeout to avoid namespace errors in standard browser React environments
  const timerRef = useRef<any>(null);

  const submitExam = useCallback((isAuto: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate Score
    let score = 0;
    exam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        score += (exam.totalMarks / exam.questions.length);
      }
    });

    const submission: Submission = {
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      examId: exam.id,
      studentId: student.id,
      answers,
      score: Math.round(score),
      startTime,
      endTime: Date.now(),
      warningsCount: warnings,
      isAutoSubmitted: isAuto,
      status: 'SUBMITTED'
    };

    onComplete(submission);
  }, [answers, exam, student.id, startTime, warnings, onComplete]);

  // Timer logic
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examStarted, timeLeft, submitExam]);

  // Anti-cheat detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && examStarted) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next > WARNING_LIMIT) {
            submitExam(true);
          }
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && examStarted) {
        setIsFullscreen(false);
        setWarnings(prev => {
          const next = prev + 1;
          if (next > WARNING_LIMIT) {
            submitExam(true);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [examStarted, submitExam]);

  const startExam = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setExamStarted(true);
    } catch (err) {
      alert("Fullscreen is mandatory for the exam. Please allow it.");
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  if (!examStarted) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-50">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <ShieldCheck size={48} className="text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
          <p className="text-slate-400 mb-6">
            You are about to start <strong>{exam.name}</strong>. 
            Once started, you cannot exit fullscreen or switch tabs.
          </p>
          <div className="space-y-3 text-left bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800">
            <p className="text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Duration: {exam.durationMinutes} Minutes</p>
            <p className="text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Total Questions: {exam.questions.length}</p>
            <p className="text-sm flex items-center gap-2 text-amber-500 font-medium">
              <AlertTriangle size={14}/> Warning Limit: 3 Attempts
            </p>
          </div>
          <button 
            onClick={startExam}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Expand size={18}/> Enter Fullscreen & Start
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50 overflow-hidden">
      {/* Exam Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-indigo-500">{PLATFORM_NAME}</h1>
          <div className="h-6 w-px bg-slate-700 hidden sm:block"/>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{exam.name}</p>
            <p className="text-xs text-slate-500">Student: {student.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${warnings > 0 ? 'bg-red-950/30 border-red-800 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
            <AlertTriangle size={16}/>
            <span className="text-sm font-bold">Warnings: {warnings}/{WARNING_LIMIT}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-xl font-bold shadow-inner ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
            <Timer size={22}/>
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => { if(window.confirm("Are you sure you want to submit?")) submitExam() }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            <Send size={18}/> Submit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto hidden md:block">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Question Progress</h3>
          <div className="grid grid-cols-5 gap-3">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full aspect-square rounded-lg font-bold flex items-center justify-center transition-all ${
                  currentQuestionIndex === idx 
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' 
                    : answers[idx] !== -1 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Attempted</span>
              <span className="text-emerald-400">{answers.filter(a => a !== -1).length}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Remaining</span>
              <span className="text-slate-200">{exam.questions.length - answers.filter(a => a !== -1).length}</span>
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                Question {currentQuestionIndex + 1}
              </span>
              <div className="h-0.5 flex-1 bg-slate-800 rounded-full">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {currentQuestion.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 max-h-80 flex justify-center">
                <img src={currentQuestion.imageUrl} alt="Question" className="object-contain" />
              </div>
            )}

            <h2 className="text-2xl font-semibold leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleOptionSelect(oIdx)}
                  className={`group w-full text-left p-5 rounded-xl border transition-all flex items-center gap-4 ${
                    answers[currentQuestionIndex] === oIdx
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                    answers[currentQuestionIndex] === oIdx
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 group-hover:bg-slate-700'
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className={`text-lg ${answers[currentQuestionIndex] === oIdx ? 'text-indigo-100 font-medium' : 'text-slate-300'}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-8">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-all"
              >
                <ChevronLeft size={20}/> Previous
              </button>
              
              {currentQuestionIndex === exam.questions.length - 1 ? (
                 <button
                 onClick={() => { if(window.confirm("Are you sure you want to submit?")) submitExam() }}
                 className="flex items-center gap-2 px-10 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-900/20 transition-all"
               >
                 Submit Final Answer <Send size={20}/>
               </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-900/20 transition-all ml-auto"
                >
                  Next Question <ChevronRight size={20}/>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Internal Helper for Icon
const ShieldCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);

export default ExamRoom;
