import type { ReactElement } from "react";
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AssignmentManagementPage } from "./components/AssignmentManagementPage";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { CourseListPage } from "./components/CourseListPage";
import { CreateCoursePage } from "./components/CreateCoursePage";
import { LoginSignupPage } from "./components/LoginSignupPage";
import { ProfilePage } from "./components/ProfilePage";
import { StudentManagementPage } from "./components/StudentManagementPage";
import {
  DashboardHome,
  TeacherDashboard,
} from "./components/TeacherDashboard";

function ProtectedRoute({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactElement;
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("isAuthenticated") === "true";
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    window.localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.localStorage.removeItem("isAuthenticated");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginSignupPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <TeacherDashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/create-course" element={<CreateCoursePage />} />
        <Route path="/assignments" element={<AssignmentManagementPage />} />
        <Route path="/students" element={<StudentManagementPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/curriculum" element={<CourseDetailPage />} />
      </Route>
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
