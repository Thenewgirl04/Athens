import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LoginSignupPageProps {
  onLogin: () => void;
}

export function LoginSignupPage({ onLogin }: LoginSignupPageProps) {
  const navigate = useNavigate();
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    console.log("Logging in...", { loginEmail, loginPassword });
    onLogin();
    navigate("/dashboard", { replace: true });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    if (signupPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signing up...", {
      signupName,
      signupEmail,
      signupPassword,
      role,
    });
    onLogin();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-full max-w-md">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80"
              alt="Students learning"
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl text-gray-800">
              Welcome to Project X LMS
            </h2>
            <p className="text-lg text-gray-600">
              Empowering education through technology
            </p>
          </div>
        </div>

        {/* Right Side - Login/Signup Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Project X LMS</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Learning Management System
              </p>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email or Username</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <a
                        href="#"
                        className="text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Log In
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">I am a...</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select value={role} onValueChange={setRole} required>
                          <SelectTrigger id="role" className="pl-10">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Create Account
                    </Button>

                    <p className="text-xs text-center text-gray-600">
                      By signing up, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
