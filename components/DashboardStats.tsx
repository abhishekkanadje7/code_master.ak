
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const DashboardStats: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-opacity-100`}>
              <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
