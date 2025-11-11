import { useState } from "react";
import {
  BookOpen,
  Users,
  FileText,
  UserCircle,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { CourseListPage } from "./CourseListPage";
import { AssignmentManagementPage } from "./AssignmentManagementPage";
import { StudentManagementPage } from "./StudentManagementPage";
import { ProfilePage } from "./ProfilePage";
import { CourseDetailPage } from "./CourseDetailPage";
import { CreateCoursePage } from "./CreateCoursePage";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}

interface Activity {
  id: string;
  type: "submission" | "quiz" | "announcement";
  message: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "submission",
    message: "John Doe submitted Assignment 2",
    time: "5 minutes ago",
  },
  {
    id: "2",
    type: "quiz",
    message: "Quiz 1 results are ready",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "submission",
    message: "Sarah Williams submitted Final Project",
    time: "2 hours ago",
  },
  {
    id: "4",
    type: "announcement",
    message: "New student enrolled in CS101",
    time: "3 hours ago",
  },
  {
    id: "5",
    type: "submission",
    message: "Mike Johnson submitted Assignment 1",
    time: "5 hours ago",
  },
];

interface TeacherDashboardProps {
  onLogout: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "submission":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      case "announcement":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "submission":
        return "bg-blue-500/10 text-blue-500";
      case "quiz":
        return "bg-green-500/10 text-green-500";
      case "announcement":
        return "bg-purple-500/10 text-purple-500";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">EduPortal</span>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "courses"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>My Courses</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "create"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Create Course</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "assignments"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "students"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activeTab === "profile"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <UserCircle className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl mb-2">Welcome, Prof. Roberts! 👋</h1>
                <p className="text-gray-600">
                  Here's what's happening with your courses today.
                </p>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-600 text-white">
                  PR
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Courses Managed"
                value="6"
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                trend="2 active this semester"
              />
              <StatCard
                title="Active Students"
                value="142"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                trend="+12 from last month"
              />
              <StatCard
                title="Pending Submissions"
                value="23"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                trend="Due within 48 hours"
              />
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id}>
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-lg ${getActivityColor(
                              activity.type
                            )}`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        {index < activities.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="default"
                    onClick={() => setActiveTab("create")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Course
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("assignments")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("assignments")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Grade Submissions
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("students")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Students
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "courses" && !selectedCourse && (
          <CourseListPage 
            onCreateCourse={() => setActiveTab("create")}
            onEditCourse={(id, name, code) => {
              setSelectedCourse({ id, name, code });
            }}
          />
        )}

        {activeTab === "courses" && selectedCourse && (
          <CourseDetailPage
            courseId={selectedCourse.id}
            courseName={selectedCourse.name}
            courseCode={selectedCourse.code}
            onBack={() => setSelectedCourse(null)}
          />
        )}

        {activeTab === "create" && (
          <CreateCoursePage />
        )}

        {activeTab === "assignments" && (
          <AssignmentManagementPage onCreateAssignment={() => setActiveTab("create")} />
        )}

        {activeTab === "students" && (
          <StudentManagementPage />
        )}

        {activeTab === "profile" && (
          <ProfilePage />
        )}
      </main>
    </div>
  );
}
