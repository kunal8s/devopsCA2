import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/Home/HomePage';
import StudentSignup from './pages/StudentSignup';
import SuccessPage from './pages/StudentSignup/SuccessPage';
import TeacherSignup from './pages/TeacherSignup';
import TeacherSuccessPage from './pages/TeacherSignup/SuccessPage';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentExam from './pages/StudentExam';
import StudentAvailableExams from './pages/StudentAvailableExams';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ScheduledExams from './pages/AdminTests/ScheduledExams';
import CreateTest from './pages/AdminTests/CreateTest';
import AdminStudentsPage from './pages/AdminStudents';
import { resetAuthOnNewBrowserSession } from './services/sessionManager';
import StudentProfile from './pages/StudentProfile';

const queryClient = new QueryClient();

function App() {
  // On the very first mount in this browser session, ensure that any stale
  // tokens from a previous Chrome session are cleaned up. This guarantees
  // that closing Chrome (red cross) and reopening starts from a fresh state.
  useEffect(() => {
    resetAuthOnNewBrowserSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/student-signup" element={<StudentSignup />} />
          <Route path="/auth/student-login" element={<StudentLogin />} />
          <Route path="/auth/admin-login" element={<AdminLogin />} />
          <Route path="/registration-success" element={<SuccessPage />} />
          <Route path="/auth/teacher-signup" element={<TeacherSignup />} />
          <Route path="/auth/teacher-login" element={<TeacherLogin />} />
          <Route path="/teacher/registration-success" element={<TeacherSuccessPage />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/available-exams" element={<StudentAvailableExams />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/exams/:testId" element={<StudentExam />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/scheduled-exams" element={<ScheduledExams />} />
          <Route path="/admin/tests/new" element={<CreateTest />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;