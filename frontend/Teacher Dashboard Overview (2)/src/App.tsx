import { useState } from "react";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { LoginSignupPage } from "./components/LoginSignupPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginSignupPage onLogin={handleLogin} />
      ) : (
        <TeacherDashboard onLogout={handleLogout} />
      )}
    </>
  );
}
