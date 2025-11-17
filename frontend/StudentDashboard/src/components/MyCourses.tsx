import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Bell,
  Users,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

interface CourseData {
  id: number;
  name: string;
  thumbnail: string;
  enrolledStudents: number;
  completionRate: number;
  category: string;
  lastUpdated: string;
}

const mockCoursesData: CourseData[] = [
  {
    id: 1,
    name: 'Introduction to Programming',
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2MjMxNzI1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 245,
    completionRate: 78,
    category: 'Computer Science',
    lastUpdated: 'Nov 3, 2025',
  },
  {
    id: 2,
    name: 'Digital Art Masterclass',
    thumbnail: 'https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBwYWludGluZ3xlbnwxfHx8fDE3NjIyNTMzNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 189,
    completionRate: 65,
    category: 'Arts & Design',
    lastUpdated: 'Nov 4, 2025',
  },
  {
    id: 3,
    name: 'Advanced Mathematics',
    thumbnail: 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGVxdWF0aW9uc3xlbnwxfHx8fDE3NjIyMTY3NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 167,
    completionRate: 82,
    category: 'Mathematics',
    lastUpdated: 'Nov 2, 2025',
  },
  {
    id: 4,
    name: 'Marketing Strategy 101',
    thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBzdHJhdGVneXxlbnwxfHx8fDE3NjIzMDMwOTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 312,
    completionRate: 71,
    category: 'Business',
    lastUpdated: 'Nov 5, 2025',
  },
  {
    id: 5,
    name: 'Chemistry Laboratory Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1614934273038-8829c68de36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeXxlbnwxfHx8fDE3NjIxOTUzMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 134,
    completionRate: 69,
    category: 'Science',
    lastUpdated: 'Nov 1, 2025',
  },
  {
    id: 6,
    name: 'World History: Ancient Civilizations',
    thumbnail: 'https://images.unsplash.com/photo-1491841651911-c44c30c34548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwYm9va3N8ZW58MXx8fHwxNzYyMzE3MjU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    enrolledStudents: 198,
    completionRate: 75,
    category: 'History',
    lastUpdated: 'Nov 4, 2025',
  },
];

export function MyCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState('courses');

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

  const handleViewCourse = (courseId: number) => {
    navigate(`/courses/${courseId}`);
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
              <h2 className="text-slate-900">My Courses</h2>
              <p className="text-slate-500">Manage and track all your courses</p>
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

        {/* Courses Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-slate-900 mb-2">All Courses</h3>
            <p className="text-slate-600">You're managing {mockCoursesData.length} courses</p>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCoursesData.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={course.thumbnail}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-slate-900 line-clamp-2">{course.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{course.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-slate-900">{course.enrolledStudents}</p>
                        <p className="text-xs text-slate-500">Students</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-slate-900">{course.completionRate}%</p>
                        <p className="text-xs text-slate-500">Completion</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Course Progress</span>
                      <span className="text-slate-900">{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>

                  {/* Last Updated */}
                  <p className="text-xs text-slate-500">
                    Last updated: {course.lastUpdated}
                  </p>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      size="sm"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      <Eye className="w-4 h-4" />
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
