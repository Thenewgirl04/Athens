import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  MessageSquare,
  Eye,
  CheckCircle,
  Video,
  Link as LinkIcon,
  File,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CourseDetailPageProps {
  courseId: string;
  courseName: string;
  courseCode: string;
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "pdf" | "link" | "document";
  uploadedDate: string;
  size?: string;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  duration: string;
  attempts: number;
}

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  grade: number;
  lastActive: string;
}

const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Variables and Data Types",
    type: "video",
    uploadedDate: "2025-10-15",
    size: "125 MB",
  },
  {
    id: "2",
    title: "Control Structures - Lecture Notes",
    type: "pdf",
    uploadedDate: "2025-10-18",
    size: "2.5 MB",
  },
  {
    id: "3",
    title: "Python Documentation",
    type: "link",
    uploadedDate: "2025-10-20",
  },
  {
    id: "4",
    title: "Functions and Modules",
    type: "document",
    uploadedDate: "2025-10-25",
    size: "1.8 MB",
  },
];

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Assignment 1: Variables Practice",
    dueDate: "2025-11-10",
    submissions: 38,
    totalStudents: 45,
  },
  {
    id: "2",
    title: "Assignment 2: Control Flow",
    dueDate: "2025-11-15",
    submissions: 12,
    totalStudents: 45,
  },
];

const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Quiz 1: Python Basics",
    questions: 10,
    duration: "30 min",
    attempts: 42,
  },
  {
    id: "2",
    title: "Midterm Quiz",
    questions: 25,
    duration: "60 min",
    attempts: 38,
  },
];

const mockStudents: EnrolledStudent[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@university.edu",
    progress: 78,
    grade: 85,
    lastActive: "2025-11-05",
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.w@university.edu",
    progress: 92,
    grade: 94,
    lastActive: "2025-11-05",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@university.edu",
    progress: 65,
    grade: 72,
    lastActive: "2025-11-04",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily.chen@university.edu",
    progress: 88,
    grade: 91,
    lastActive: "2025-11-05",
  },
];

export function CourseDetailPage({
  courseId,
  courseName,
  courseCode,
  onBack,
}: CourseDetailPageProps) {
  const [activeSection, setActiveSection] = useState<
    "lessons" | "assignments" | "quizzes" | "students"
  >("lessons");
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-purple-600" />;
      case "pdf":
        return <File className="h-4 w-4 text-red-600" />;
      case "link":
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h2 className="text-xl mb-1">{courseName}</h2>
            <p className="text-sm text-gray-600">{courseCode}</p>
          </div>
        </div>

        <nav className="px-3 space-y-1">
          <button
            onClick={() => setActiveSection("lessons")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeSection === "lessons"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Lessons / Modules</span>
          </button>

          <button
            onClick={() => setActiveSection("assignments")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeSection === "assignments"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Assignments</span>
          </button>

          <button
            onClick={() => setActiveSection("quizzes")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeSection === "quizzes"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <HelpCircle className="h-5 w-5" />
            <span>Quizzes</span>
          </button>

          <button
            onClick={() => setActiveSection("students")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeSection === "students"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Students</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8">
        {/* Lessons Section */}
        {activeSection === "lessons" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl mb-2">Lessons & Modules</h1>
                <p className="text-gray-600">
                  Manage course materials and learning resources
                </p>
              </div>
              <Button onClick={() => setShowAddLesson(!showAddLesson)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            {/* Add Lesson Form */}
            {showAddLesson && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Lesson</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="lesson-title">Lesson Title</Label>
                    <Input
                      id="lesson-title"
                      placeholder="e.g., Introduction to Arrays"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Material Type</Label>
                    <Tabs defaultValue="video" className="mt-2">
                      <TabsList>
                        <TabsTrigger value="video">Video</TabsTrigger>
                        <TabsTrigger value="pdf">PDF</TabsTrigger>
                        <TabsTrigger value="link">Link</TabsTrigger>
                        <TabsTrigger value="document">Document</TabsTrigger>
                      </TabsList>
                      <TabsContent value="video" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload video file
                          </p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="pdf" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload PDF document
                          </p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="link" className="mt-4">
                        <Input placeholder="Enter URL (e.g., https://...)" />
                      </TabsContent>
                      <TabsContent value="document" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload document
                          </p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button>Add Lesson</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddLesson(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lessons List */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {mockLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div>
                          <p className="mb-1">{lesson.title}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>
                              Uploaded: {new Date(lesson.uploadedDate).toLocaleDateString()}
                            </span>
                            {lesson.size && <span>• {lesson.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Assignments Section */}
        {activeSection === "assignments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl mb-2">Assignments</h1>
                <p className="text-gray-600">
                  Create and manage course assignments
                </p>
              </div>
              <Button onClick={() => setShowAddAssignment(!showAddAssignment)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            {/* Add Assignment Form */}
            {showAddAssignment && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="assignment-title">Assignment Title</Label>
                    <Input
                      id="assignment-title"
                      placeholder="e.g., Week 3 Programming Exercise"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assignment-description">Description</Label>
                    <Textarea
                      id="assignment-description"
                      placeholder="Describe the assignment requirements..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-points">Maximum Points</Label>
                      <Input
                        id="max-points"
                        type="number"
                        placeholder="100"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button>Create Assignment</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAssignment(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments List */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            {assignment.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {assignment.submissions} / {assignment.totalStudents}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Submissions
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Grade
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quizzes Section */}
        {activeSection === "quizzes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl mb-2">Quizzes</h1>
                <p className="text-gray-600">Create and manage course quizzes</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Questions
                </Button>
                <Button onClick={() => setShowAddQuiz(!showAddQuiz)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </div>
            </div>

            {/* Add Quiz Form */}
            {showAddQuiz && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      placeholder="e.g., Chapter 3 Quiz"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiz-duration">Duration (minutes)</Label>
                      <Input
                        id="quiz-duration"
                        type="number"
                        placeholder="30"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiz-questions">Number of Questions</Label>
                      <Input
                        id="quiz-questions"
                        type="number"
                        placeholder="10"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button>Create Quiz</Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddQuiz(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quizzes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockQuizzes.map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span>{quiz.questions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{quiz.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Student Attempts:</span>
                        <span>{quiz.attempts}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Students Section */}
        {activeSection === "students" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl mb-2">Enrolled Students</h1>
                <p className="text-gray-600">
                  View student progress and send messages
                </p>
              </div>
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message to All
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-600 text-white">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{student.progress}%</span>
                            </div>
                            <Progress value={student.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student.grade >= 90
                                ? "bg-green-500/10 text-green-700 border-green-200"
                                : student.grade >= 80
                                ? "bg-blue-500/10 text-blue-700 border-blue-200"
                                : "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                            }
                          >
                            {student.grade}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(student.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
