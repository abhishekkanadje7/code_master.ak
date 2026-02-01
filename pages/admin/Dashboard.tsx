
import React, { useMemo } from 'react';
import { StorageService } from '../../services/storage';
import DashboardStats from '../../components/DashboardStats';
import { Users, BookOpen, CheckCircle2, Award, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const students = useMemo(() => StorageService.getUsers().filter(u => u.role === 'STUDENT'), []);
  const batches = useMemo(() => StorageService.getBatches(), []);
  const exams = useMemo(() => StorageService.getExams(), []);
  const submissions = useMemo(() => StorageService.getSubmissions(), []);

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'bg-indigo-500' },
    { label: 'Total Batches', value: batches.length, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Exams Conducted', value: exams.filter(e => e.status === 'COMPLETED').length, icon: BookOpen, color: 'bg-amber-500' },
    { label: 'Total Submissions', value: submissions.length, icon: CheckCircle2, color: 'bg-indigo-500' }
  ];

  const batchData = useMemo(() => {
    return batches.map(b => ({
      name: b.name,
      students: students.filter(s => s.batchId === b.id).length
    }));
  }, [batches, students]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Students per Batch</h3>
            <div className="p-2 bg-slate-800 rounded-lg"><TrendingUp size={18} className="text-slate-400"/></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Exam Activity</h3>
            <div className="p-2 bg-slate-800 rounded-lg"><Award size={18} className="text-slate-400"/></div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: exams.filter(e => e.status === 'ACTIVE').length },
                    { name: 'Upcoming', value: exams.filter(e => e.status === 'UPCOMING').length },
                    { name: 'Completed', value: exams.filter(e => e.status === 'COMPLETED').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-6">Recent Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm">
                <th className="pb-4 font-semibold">Student</th>
                <th className="pb-4 font-semibold">Exam</th>
                <th className="pb-4 font-semibold">Score</th>
                <th className="pb-4 font-semibold">Warnings</th>
                <th className="pb-4 font-semibold text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {submissions.slice(-5).reverse().map((sub) => {
                const student = students.find(s => s.id === sub.studentId);
                const exam = exams.find(e => e.id === sub.examId);
                return (
                  <tr key={sub.id} className="text-sm">
                    <td className="py-4 font-medium">{student?.name || 'Unknown'}</td>
                    <td className="py-4 text-slate-400">{exam?.name || 'Deleted Exam'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md font-bold ${sub.score >= (exam?.totalMarks || 0) * 0.4 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                        {sub.score}/{exam?.totalMarks || 100}
                      </span>
                    </td>
                    <td className="py-4">
                      {sub.warningsCount > 0 ? (
                        <span className="text-amber-500">{sub.warningsCount} Warnings</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-500 text-right">{new Date(sub.endTime).toLocaleTimeString()}</td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 italic">No recent submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
