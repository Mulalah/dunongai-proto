import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase';
import { seedDatabase } from './utils/seedData';

// Code-split each page so the initial bundle stays small (faster first load
// on weak connections).
const Landing = lazy(() => import('./pages/auth/Landing'));
const StudentLogin = lazy(() => import('./pages/auth/StudentLogin'));
const TeacherLogin = lazy(() => import('./pages/auth/TeacherLogin'));
const Signup = lazy(() => import('./pages/auth/Signup'));

const DiagnosticQuiz = lazy(() => import('./pages/student/DiagnosticQuiz'));
const LevelAssigned = lazy(() => import('./pages/student/LevelAssigned'));
const StoryLibrary = lazy(() => import('./pages/student/StoryLibrary'));
const StoryReader = lazy(() => import('./pages/student/StoryReader'));
const Comprehension = lazy(() => import('./pages/student/Comprehension'));
const SessionComplete = lazy(() => import('./pages/student/SessionComplete'));
const Progress = lazy(() => import('./pages/student/Progress'));

const ClassDashboard = lazy(() => import('./pages/teacher/ClassDashboard'));
const StudentProfile = lazy(() => import('./pages/teacher/StudentProfile'));
const FlaggedStudents = lazy(() => import('./pages/teacher/FlaggedStudents'));

const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const Settings = lazy(() => import('./pages/Settings'));

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

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingSpinner message="Inihahanda ang DunongAI…" />
    </div>
  );
}

function AppRoutes() {
  return (
    <PageTransitions>
      <Suspense fallback={<SuspenseFallback />}>
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

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
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
