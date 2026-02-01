
import React, { useState, useEffect } from 'react';
import { User, Role, Exam, Submission } from './types';
import { StorageService } from './services/storage';
import { PLATFORM_NAME } from './constants';
import Layout from './components/Layout';
import ExamRoom from './pages/ExamRoom';
import LoginPage from './pages/LoginPage';

// Specific sub-views for Admin
import AdminDashboard from './pages/admin/Dashboard';
import BatchManagement from './pages/admin/Batches';
import StudentManagement from './pages/admin/Students';
import ExamManagement from './pages/admin/Exams';
import AdminResults from './pages/admin/Results';

// Student sub-views
import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import StudentResults from './pages/student/Results';
import ProfileSettings from './pages/student/Profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  useEffect(() => {
    StorageService.init();
    const storedUser = localStorage.getItem('cm_active_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cm_active_user', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cm_active_user');
    setCurrentExam(null);
  };

  const handleStartExam = (exam: Exam) => {
    setCurrentExam(exam);
  };

  const handleExamComplete = (submission: Submission) => {
    StorageService.addSubmission(submission);
    setCurrentExam(null);
    setActiveTab('results');
  };

  if (currentExam && user) {
    return (
      <ExamRoom 
        exam={currentExam} 
        student={user} 
        onComplete={handleExamComplete} 
      />
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (user.role === Role.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'batches': return <BatchManagement />;
        case 'students': return <StudentManagement />;
        case 'exams': return <ExamManagement />;
        case 'results': return <AdminResults />;
        default: return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard user={user} />;
        case 'exams': return <StudentExams user={user} onStartExam={handleStartExam} />;
        case 'results': return <StudentResults user={user} />;
        case 'profile': return <ProfileSettings user={user} onUpdate={setUser} />;
        default: return <StudentDashboard user={user} />;
      }
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
