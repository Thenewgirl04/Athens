import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Bell,
  Camera,
  ChevronRight,
  Mail,
  Phone,
  GraduationCap,
  IdCard,
  Calendar,
  Building2,
  UserCircle2,
  BookMarked,
  Settings as SettingsIcon,
  Moon,
  Lock,
  Globe,
  Shield,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { api, Student, Assignment } from '../services/api';

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [activeNav, setActiveNav] = useState('profile');
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.role === 'student') {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [profileData, assignmentsData] = await Promise.all([
        api.getStudentProfile(user.id),
        api.getStudentAssignments(user.id),
      ]);

      setStudent(profileData.student);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/courses' },
    { id: 'assignments', label: 'Assignments', icon: FileText, path: '/assignments' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleNavigation = (path: string, id: string) => {
    setActiveNav(id);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const academicStats = student ? [
    { label: 'GPA', value: student.gpa.toFixed(2), description: 'Current GPA' },
    { label: 'Credits', value: student.credits.toString(), description: 'Completed Credits' },
    { label: 'Courses', value: student.enrolledCourses.length.toString(), description: 'Enrolled Courses' },
    { label: 'Due', value: assignments.filter(a => !a.submitted && new Date(a.dueDate) > new Date()).length.toString(), description: 'Assignments Due' },
  ] : [];

  const personalInfo = student ? [
    { label: 'Full Name', value: `${student.firstName} ${student.lastName}`, icon: User },
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Phone', value: 'N/A', icon: Phone },
    { label: 'Major', value: student.major, icon: GraduationCap },
    { label: 'Student ID', value: student.studentId, icon: IdCard },
    { label: 'Year Level', value: student.yearLevel, icon: Calendar },
  ] : [];

  const academicInfo = student ? [
    { label: 'Department', value: student.department, icon: Building2 },
    { label: 'Advisor', value: student.advisor, icon: UserCircle2 },
    { label: 'Current Semester', value: 'Fall 2025', icon: Calendar },
    { label: 'Enrolled Courses', value: `${student.enrolledCourses.length} courses`, icon: BookMarked, hasChevron: true },
  ] : [];

  const settingsOptions = [
    { label: 'Notifications', icon: Bell, description: 'Manage notification preferences' },
    { label: 'Privacy & Permissions', icon: Shield, description: 'Control your privacy settings' },
    { label: 'Account Security', icon: Lock, description: 'Password and security options' },
    { label: 'Language Preferences', icon: Globe, description: 'Change language settings' },
    { label: 'Theme', icon: Moon, description: 'Light or Dark mode', badge: 'Light' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-indigo-600">Athens</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path, item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeNav === item.id || location.pathname === item.path
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-900">Profile</h2>
              <p className="text-slate-500">Manage your account information</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Student Info Card */}
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8 text-slate-500">Loading profile...</div>
                ) : student ? (
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`} />
                        <AvatarFallback className="text-2xl">{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-slate-900 mb-2">{student.firstName} {student.lastName}</h2>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          {student.major} • {student.yearLevel}
                        </p>
                        <p className="flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          {student.studentId}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">No profile data available</div>
                )}
              </CardContent>
            </Card>

            {/* Academic Overview Stats */}
            <div>
              <h3 className="text-slate-900 mb-4">Academic Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {academicStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl text-indigo-600 mb-2">{stat.value}</div>
                        <div className="text-sm text-slate-600">{stat.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-slate-900 mb-4">Personal Information</h3>
              <Card>
                <CardContent className="p-0">
                  {personalInfo.map((info, index) => (
                    <React.Fragment key={index}>
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <info.icon className="w-5 h-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-600">{info.label}</p>
                            <p className="text-slate-900">{info.value}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                      {index < personalInfo.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-slate-900 mb-4">Academic Information</h3>
              <Card>
                <CardContent className="p-0">
                  {academicInfo.map((info, index) => (
                    <React.Fragment key={index}>
                      <div 
                        className={`flex items-center justify-between p-4 transition-colors ${
                          info.hasChevron ? 'hover:bg-slate-50 cursor-pointer' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <info.icon className="w-5 h-5 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-600">{info.label}</p>
                            <p className="text-slate-900">{info.value}</p>
                          </div>
                        </div>
                        {info.hasChevron && (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      {index < academicInfo.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-slate-900 mb-4">Settings</h3>
              <Card>
                <CardContent className="p-0">
                  {settingsOptions.map((option, index) => (
                    <React.Fragment key={index}>
                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <option.icon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900">{option.label}</p>
                            <p className="text-sm text-slate-500">{option.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {option.badge && (
                            <Badge variant="outline">{option.badge}</Badge>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                      {index < settingsOptions.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
