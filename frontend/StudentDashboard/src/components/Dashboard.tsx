import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Bell,
  ChevronRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

interface Course {
  id: number;
  title: string;
  progress: number;
  thumbnail: string;
  instructor: string;
  nextLesson: string;
}

interface Announcement {
  id: number;
  title: string;
  date: string;
  type: 'deadline' | 'announcement';
  course: string;
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Advanced Web Development',
    progress: 65,
    thumbnail: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjEzMjI3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Dr. Sarah Johnson',
    nextLesson: 'React Hooks Deep Dive',
  },
  {
    id: 2,
    title: 'Graphic Design Fundamentals',
    progress: 42,
    thumbnail: 'https://images.unsplash.com/photo-1572882724878-e17d310e6a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwdG9vbHN8ZW58MXx8fHwxNzYxMzE3NTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Prof. Michael Chen',
    nextLesson: 'Color Theory in Practice',
  },
  {
    id: 3,
    title: 'Data Science & Analytics',
    progress: 78,
    thumbnail: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjEyODU2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Dr. Emily Rodriguez',
    nextLesson: 'Machine Learning Basics',
  },
  {
    id: 4,
    title: 'Business Strategy',
    progress: 23,
    thumbnail: 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxMjk2NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    instructor: 'Prof. James Wilson',
    nextLesson: 'Market Analysis Techniques',
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Final Project Submission',
    date: 'Oct 28, 2025',
    type: 'deadline',
    course: 'Advanced Web Development',
  },
  {
    id: 2,
    title: 'New Module Released: Advanced Python',
    date: 'Oct 25, 2025',
    type: 'announcement',
    course: 'Data Science & Analytics',
  },
  {
    id: 3,
    title: 'Assignment 3 Due',
    date: 'Oct 26, 2025',
    type: 'deadline',
    course: 'Graphic Design Fundamentals',
  },
  {
    id: 4,
    title: 'Live Q&A Session Tomorrow',
    date: 'Oct 25, 2025',
    type: 'announcement',
    course: 'Business Strategy',
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

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

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-indigo-600">LearnHub</h1>
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
              <h2 className="text-slate-900">Welcome back, Arthur!</h2>
              <p className="text-slate-500">Here's what's happening with your courses today.</p>
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Courses Enrolled</CardDescription>
                <CardTitle className="text-indigo-600">12</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-slate-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">4 in progress</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Assignments Due</CardDescription>
                <CardTitle className="text-amber-600">5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">2 due this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Progress</CardDescription>
                <CardTitle className="text-emerald-600">52%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={52} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Continue Learning</h3>
              <Button variant="ghost" className="gap-2">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-slate-900 line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="text-sm">{course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-slate-900">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-sm text-slate-500 pt-2">
                        Next: {course.nextLesson}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Announcements & Deadlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Upcoming Deadlines & Announcements</h3>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-200">
                  {mockAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        announcement.type === 'deadline' 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {announcement.type === 'deadline' ? (
                          <Calendar className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-900">{announcement.title}</h4>
                        <p className="text-sm text-slate-500">{announcement.course}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={announcement.type === 'deadline' ? 'destructive' : 'secondary'}>
                          {announcement.date}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
