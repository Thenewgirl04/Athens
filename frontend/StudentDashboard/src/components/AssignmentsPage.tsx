import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Bell,
  AlertCircle,
  CalendarClock,
  Calendar,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AssignmentCard, Assignment } from './AssignmentCard';
import { AssignmentDetails } from './AssignmentDetails';
import { AssignmentFlow } from './AssignmentFlow';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useAuth } from '../contexts/AuthContext';

const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: 'Exam 2',
    courseName: 'General Physics I – CRN 13233',
    dueDate: 'Oct 31 at 11:59 PM',
    points: 100,
    status: 'missing',
    category: 'overdue',
  },
  {
    id: 2,
    title: 'Lab Report 3',
    courseName: 'General Physics I – CRN 13233',
    dueDate: 'Oct 28 at 11:59 PM',
    points: 50,
    status: 'overdue',
    category: 'overdue',
  },
  {
    id: 3,
    title: 'Final Project Submission',
    courseName: 'Advanced Web Development',
    dueDate: 'Nov 20 at 11:59 PM',
    points: 200,
    status: 'not-submitted',
    category: 'upcoming',
  },
  {
    id: 4,
    title: 'Assignment 3',
    courseName: 'Graphic Design Fundamentals',
    dueDate: 'Nov 18 at 11:59 PM',
    points: 75,
    status: 'not-submitted',
    category: 'upcoming',
  },
  {
    id: 5,
    title: 'Data Analysis Project',
    courseName: 'Data Science & Analytics',
    dueDate: 'Nov 25 at 11:59 PM',
    points: 150,
    status: 'upcoming',
    category: 'upcoming',
  },
  {
    id: 6,
    title: 'Quiz 4',
    courseName: 'Business Strategy',
    dueDate: 'Nov 15 at 11:59 PM',
    points: 50,
    status: 'upcoming',
    category: 'upcoming',
  },
  {
    id: 7,
    title: 'Practice Problems Set 1',
    courseName: 'General Physics I – CRN 13233',
    dueDate: null,
    points: 25,
    status: 'not-submitted',
    category: 'undated',
  },
  {
    id: 8,
    title: 'Extra Credit Assignment',
    courseName: 'Advanced Web Development',
    dueDate: null,
    points: 30,
    status: 'submitted',
    category: 'undated',
  },
  {
    id: 9,
    title: 'Portfolio Review',
    courseName: 'Graphic Design Fundamentals',
    dueDate: null,
    points: 100,
    status: 'graded',
    score: 92,
    category: 'undated',
  },
];

type FilterType = 'all' | 'not-submitted' | 'to-be-graded' | 'graded' | 'overdue' | 'upcoming';

export function AssignmentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState('assignments');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [undatedOpen, setUndatedOpen] = useState(true);

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

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'not-submitted', label: 'Not Submitted' },
    { id: 'to-be-graded', label: 'To Be Graded' },
    { id: 'graded', label: 'Graded' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  const filterAssignments = (assignments: Assignment[]): Assignment[] => {
    if (selectedFilter === 'all') return assignments;
    
    switch (selectedFilter) {
      case 'not-submitted':
        return assignments.filter(a => a.status === 'not-submitted' || a.status === 'missing');
      case 'to-be-graded':
        return assignments.filter(a => a.status === 'submitted');
      case 'graded':
        return assignments.filter(a => a.status === 'graded');
      case 'overdue':
        return assignments.filter(a => a.category === 'overdue');
      case 'upcoming':
        return assignments.filter(a => a.category === 'upcoming');
      default:
        return assignments;
    }
  };

  const filteredAssignments = filterAssignments(mockAssignments);
  const overdueAssignments = filteredAssignments.filter(a => a.category === 'overdue');
  const upcomingAssignments = filteredAssignments.filter(a => a.category === 'upcoming');
  const undatedAssignments = filteredAssignments.filter(a => a.category === 'undated');

  if (selectedAssignment) {
    return (
      <AssignmentFlow
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

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
              <h2 className="text-slate-900">Assignments</h2>
              <p className="text-slate-500">All assignments across your courses</p>
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

        {/* Assignments Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Filter Pills */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {filterButtons.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={
                    selectedFilter === filter.id
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : ''
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Overdue Assignments */}
            {overdueAssignments.length > 0 && (
              <Collapsible open={overdueOpen} onOpenChange={setOverdueOpen}>
                <div className="space-y-3">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h3 className="text-red-600">
                          Overdue Assignments ({overdueAssignments.length})
                        </h3>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3">
                    {overdueAssignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onClick={() => setSelectedAssignment(assignment)}
                      />
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
              <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
                <div className="space-y-3">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-amber-600" />
                        <h3 className="text-amber-600">
                          Upcoming Assignments ({upcomingAssignments.length})
                        </h3>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onClick={() => setSelectedAssignment(assignment)}
                      />
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Undated Assignments */}
            {undatedAssignments.length > 0 && (
              <Collapsible open={undatedOpen} onOpenChange={setUndatedOpen}>
                <div className="space-y-3">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        <h3 className="text-slate-600">
                          Undated Assignments ({undatedAssignments.length})
                        </h3>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3">
                    {undatedAssignments.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onClick={() => setSelectedAssignment(assignment)}
                      />
                    ))}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            {/* Empty State */}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 mb-2">No assignments found</h3>
                <p className="text-slate-500">
                  Try adjusting your filters to see more assignments
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}