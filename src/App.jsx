import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase';
import { seedDatabase } from './utils/seedData';

import Landing from './pages/auth/Landing';
import StudentLogin from './pages/auth/StudentLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import Signup from './pages/auth/Signup';

import DiagnosticQuiz from './pages/student/DiagnosticQuiz';
import LevelAssigned from './pages/student/LevelAssigned';
import StoryLibrary from './pages/student/StoryLibrary';
import StoryReader from './pages/student/StoryReader';
import Comprehension from './pages/student/Comprehension';
import SessionComplete from './pages/student/SessionComplete';
import Progress from './pages/student/Progress';

import ClassDashboard from './pages/teacher/ClassDashboard';
import StudentProfile from './pages/teacher/StudentProfile';
import FlaggedStudents from './pages/teacher/FlaggedStudents';

import ParentDashboard from './pages/parent/ParentDashboard';

import LoadingSpinner from './components/ui/LoadingSpinner';

function ProtectedRoute({ role, children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner message="Inihahanda ang DunongAI…" />
      </div>
    );
  }
  if (!user || !profile) {
    return (
      <Navigate
        to={role === 'teacher' ? '/login/teacher' : '/login/student'}
        state={{ from: location }}
        replace
      />
    );
  }
  if (role && profile.role !== role) {
    const home =
      profile.role === 'teacher'
        ? '/teacher/dashboard'
        : profile.role === 'parent'
        ? '/parent/dashboard'
        : '/student/library';
    return <Navigate to={home} replace />;
  }
  return children;
}

function PageTransitions({ children }) {
  const location = useLocation();
  return <div key={location.pathname}>{children}</div>;
}

function AppRoutes() {
  return (
    <PageTransitions>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/teacher" element={<TeacherLogin />} />
        <Route path="/signup/:role" element={<Signup />} />

        <Route
          path="/student/quiz"
          element={
            <ProtectedRoute role="student">
              <DiagnosticQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/level-up"
          element={
            <ProtectedRoute role="student">
              <LevelAssigned />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/library"
          element={
            <ProtectedRoute role="student">
              <StoryLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/read/:id"
          element={
            <ProtectedRoute role="student">
              <StoryReader />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/questions"
          element={
            <ProtectedRoute role="student">
              <Comprehension />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complete"
          element={
            <ProtectedRoute role="student">
              <SessionComplete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
            <ProtectedRoute role="student">
              <Progress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <ClassDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/student/:id"
          element={
            <ProtectedRoute role="teacher">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/flagged"
          element={
            <ProtectedRoute role="teacher">
              <FlaggedStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransitions>
  );
}

export default function App() {
  useEffect(() => {
    seedDatabase(db).catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
