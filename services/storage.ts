
import { User, Batch, Exam, Submission, Role } from '../types';
import { INITIAL_BATCHES, ADMIN_CREDENTIALS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'cm_users',
  BATCHES: 'cm_batches',
  EXAMS: 'cm_exams',
  SUBMISSIONS: 'cm_submissions'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const save = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const admin: User = {
        id: 'admin_01',
        name: 'Super Admin',
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        role: Role.ADMIN,
        createdAt: Date.now()
      };
      save(STORAGE_KEYS.USERS, [admin]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
      save(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) {
      save(STORAGE_KEYS.EXAMS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      save(STORAGE_KEYS.SUBMISSIONS, []);
    }
  },

  // Users
  getUsers: () => get<User[]>(STORAGE_KEYS.USERS, []),
  addUser: (user: User) => {
    const users = StorageService.getUsers();
    save(STORAGE_KEYS.USERS, [...users, user]);
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const users = StorageService.getUsers();
    save(STORAGE_KEYS.USERS, users.map(u => u.id === id ? { ...u, ...updates } : u));
  },
  deleteUser: (id: string) => {
    const users = StorageService.getUsers();
    save(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
  },

  // Batches
  getBatches: () => get<Batch[]>(STORAGE_KEYS.BATCHES, []),
  addBatch: (batch: Batch) => {
    const batches = StorageService.getBatches();
    save(STORAGE_KEYS.BATCHES, [...batches, batch]);
  },
  updateBatch: (id: string, updates: Partial<Batch>) => {
    const batches = StorageService.getBatches();
    save(STORAGE_KEYS.BATCHES, batches.map(b => b.id === id ? { ...b, ...updates } : b));
  },
  deleteBatch: (id: string, options: 'DELETE_STUDENTS' | 'UNASSIGN_STUDENTS') => {
    const batches = StorageService.getBatches();
    save(STORAGE_KEYS.BATCHES, batches.filter(b => b.id !== id));
    
    if (options === 'DELETE_STUDENTS') {
      const users = StorageService.getUsers();
      save(STORAGE_KEYS.USERS, users.filter(u => u.batchId !== id));
    } else {
      const users = StorageService.getUsers();
      save(STORAGE_KEYS.USERS, users.map(u => u.batchId === id ? { ...u, batchId: undefined } : u));
    }
  },

  // Exams
  getExams: () => {
    const exams = get<Exam[]>(STORAGE_KEYS.EXAMS, []);
    const now = Date.now();
    // Update statuses dynamically
    return exams.map(exam => {
      let status: Exam['status'] = 'UPCOMING';
      if (now >= exam.startTime && now <= exam.endTime) status = 'ACTIVE';
      else if (now > exam.endTime) status = 'COMPLETED';
      return { ...exam, status };
    });
  },
  addExam: (exam: Exam) => {
    const exams = get<Exam[]>(STORAGE_KEYS.EXAMS, []);
    save(STORAGE_KEYS.EXAMS, [...exams, exam]);
  },
  updateExam: (id: string, updates: Partial<Exam>) => {
    const exams = get<Exam[]>(STORAGE_KEYS.EXAMS, []);
    save(STORAGE_KEYS.EXAMS, exams.map(e => e.id === id ? { ...e, ...updates } : e));
  },
  deleteExam: (id: string) => {
    const exams = get<Exam[]>(STORAGE_KEYS.EXAMS, []);
    save(STORAGE_KEYS.EXAMS, exams.filter(e => e.id !== id));
  },

  // Submissions
  getSubmissions: () => get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []),
  addSubmission: (submission: Submission) => {
    const submissions = StorageService.getSubmissions();
    save(STORAGE_KEYS.SUBMISSIONS, [...submissions, submission]);
  }
};
