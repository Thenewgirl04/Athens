import { useState } from "react";
import {
  Search,
  Mail,
  MessageSquare,
  Filter,
  User,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  averageGrade: number;
  lastLogin: string;
  enrolledCourses: string[];
  performanceLevel: "excellent" | "good" | "average" | "needs-improvement";
}

const students: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@university.edu",
    progress: 78,
    averageGrade: 85,
    lastLogin: "2025-11-05 14:30",
    enrolledCourses: ["CS101", "CS105"],
    performanceLevel: "good",
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.w@university.edu",
    progress: 92,
    averageGrade: 94,
    lastLogin: "2025-11-05 16:45",
    enrolledCourses: ["CS101", "CS201", "CS105"],
    performanceLevel: "excellent",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@university.edu",
    progress: 65,
    averageGrade: 72,
    lastLogin: "2025-11-04 09:15",
    enrolledCourses: ["CS201"],
    performanceLevel: "average",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily.chen@university.edu",
    progress: 88,
    averageGrade: 91,
    lastLogin: "2025-11-05 11:20",
    enrolledCourses: ["CS105", "CS301"],
    performanceLevel: "excellent",
  },
  {
    id: "5",
    name: "David Brown",
    email: "d.brown@university.edu",
    progress: 45,
    averageGrade: 58,
    lastLogin: "2025-11-02 08:45",
    enrolledCourses: ["CS101"],
    performanceLevel: "needs-improvement",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa.a@university.edu",
    progress: 82,
    averageGrade: 87,
    lastLogin: "2025-11-05 13:10",
    enrolledCourses: ["CS201", "CS301"],
    performanceLevel: "good",
  },
  {
    id: "7",
    name: "James Wilson",
    email: "james.w@university.edu",
    progress: 70,
    averageGrade: 76,
    lastLogin: "2025-11-05 10:30",
    enrolledCourses: ["CS105"],
    performanceLevel: "average",
  },
  {
    id: "8",
    name: "Maria Garcia",
    email: "maria.g@university.edu",
    progress: 95,
    averageGrade: 96,
    lastLogin: "2025-11-05 15:20",
    enrolledCourses: ["CS101", "CS201", "CS301"],
    performanceLevel: "excellent",
  },
];

export function StudentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedPerformance, setSelectedPerformance] = useState<string>("all");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPerformanceBadge = (level: Student["performanceLevel"]) => {
    const styles = {
      excellent: "bg-green-500/10 text-green-700 border-green-200",
      good: "bg-blue-500/10 text-blue-700 border-blue-200",
      average: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      "needs-improvement": "bg-red-500/10 text-red-700 border-red-200",
    };

    const labels = {
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      "needs-improvement": "Needs Improvement",
    };

    return (
      <Badge variant="outline" className={styles[level]}>
        {labels[level]}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = selectedCourse === "all" || 
      student.enrolledCourses.includes(selectedCourse);
    
    const matchesPerformance = selectedPerformance === "all" || 
      student.performanceLevel === selectedPerformance;

    return matchesSearch && matchesCourse && matchesPerformance;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Students</h1>
          <p className="text-gray-600">
            Manage and track student performance across all courses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl mt-1">{students.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Progress</p>
                <p className="text-2xl mt-1">
                  {Math.round(
                    students.reduce((sum, s) => sum + s.progress, 0) / students.length
                  )}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Grade</p>
                <p className="text-2xl mt-1">
                  {Math.round(
                    students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length
                  )}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Today</p>
                <p className="text-2xl mt-1">
                  {students.filter(s => s.lastLogin.includes("2025-11-05")).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Course Filter */}
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="CS101">CS101</SelectItem>
                <SelectItem value="CS201">CS201</SelectItem>
                <SelectItem value="CS105">CS105</SelectItem>
                <SelectItem value="CS301">CS301</SelectItem>
              </SelectContent>
            </Select>

            {/* Performance Filter */}
            <Select value={selectedPerformance} onValueChange={setSelectedPerformance}>
              <SelectTrigger className="w-full md:w-52">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Performance Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Average Grade</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.enrolledCourses.length} course{student.enrolledCourses.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <span className={getProgressColor(student.progress)}>
                      {student.progress}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getGradeColor(student.averageGrade)}>
                      {student.averageGrade}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {student.lastLogin}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPerformanceBadge(student.performanceLevel)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl mb-2">No students found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
