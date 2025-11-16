import { useState } from "react";
import {
  Calendar,
  FileText,
  Users,
  Plus,
  ArrowLeft,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "open" | "closed";
  submissions: number;
  totalStudents: number;
}

interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  fileName?: string;
  fileUrl?: string;
  answers?: { question: string; answer: string }[];
  grade?: number;
  feedback?: string;
  status: "submitted" | "graded";
}

const assignments: Assignment[] = [
  {
    id: "1",
    title: "Assignment 1: Introduction to Variables",
    course: "CS101",
    dueDate: "2025-11-10",
    status: "open",
    submissions: 38,
    totalStudents: 45,
  },
  {
    id: "2",
    title: "Assignment 2: Data Structures Basics",
    course: "CS201",
    dueDate: "2025-11-08",
    status: "closed",
    submissions: 35,
    totalStudents: 38,
  },
  {
    id: "3",
    title: "Quiz 1: HTML & CSS Fundamentals",
    course: "CS105",
    dueDate: "2025-11-12",
    status: "open",
    submissions: 42,
    totalStudents: 52,
  },
  {
    id: "4",
    title: "Final Project Proposal",
    course: "CS105",
    dueDate: "2025-11-15",
    status: "open",
    submissions: 28,
    totalStudents: 52,
  },
];

const mockSubmissions: Submission[] = [
  {
    id: "1",
    studentName: "John Doe",
    studentId: "S001",
    submittedAt: "2025-11-05 14:30",
    fileName: "assignment1_johndoe.pdf",
    fileUrl: "#",
    status: "submitted",
  },
  {
    id: "2",
    studentName: "Sarah Williams",
    studentId: "S002",
    submittedAt: "2025-11-04 16:45",
    fileName: "assignment1_sarah.pdf",
    fileUrl: "#",
    grade: 85,
    feedback: "Great work! Well-structured code with good documentation.",
    status: "graded",
  },
  {
    id: "3",
    studentName: "Mike Johnson",
    studentId: "S003",
    submittedAt: "2025-11-05 09:15",
    answers: [
      { question: "What is a variable?", answer: "A variable is a container for storing data values..." },
      { question: "Explain data types", answer: "Data types specify the type of data that a variable can hold..." },
    ],
    grade: 92,
    feedback: "Excellent understanding of the concepts!",
    status: "graded",
  },
  {
    id: "4",
    studentName: "Emily Chen",
    studentId: "S004",
    submittedAt: "2025-11-05 11:20",
    fileName: "assignment1_emily.pdf",
    fileUrl: "#",
    status: "submitted",
  },
];

export function AssignmentManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredAssignments = selectedCourse === "all" 
    ? assignments 
    : assignments.filter(a => a.course === selectedCourse);

  const getStatusBadge = (status: Assignment["status"]) => {
    if (status === "open") {
      return (
        <Badge className="bg-green-500/10 text-green-700 border-green-200">
          <Clock className="h-3 w-3 mr-1" />
          Open
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">
        <XCircle className="h-3 w-3 mr-1" />
        Closed
      </Badge>
    );
  };

  const handleStartGrading = (submission: Submission) => {
    setGradingSubmission(submission);
    setGradeInput(submission.grade?.toString() || "");
    setFeedbackInput(submission.feedback || "");
  };

  const handleSaveGrade = () => {
    // In a real app, this would save to a backend
    console.log("Saving grade:", {
      submissionId: gradingSubmission?.id,
      grade: gradeInput,
      feedback: feedbackInput,
    });
    setGradingSubmission(null);
    setGradeInput("");
    setFeedbackInput("");
  };

  // Grading View
  if (gradingSubmission) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => setGradingSubmission(null)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Grade Submission</CardTitle>
            <p className="text-sm text-gray-600">
              Student: {gradingSubmission.studentName} ({gradingSubmission.studentId})
            </p>
            <p className="text-sm text-gray-600">
              Submitted: {gradingSubmission.submittedAt}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Submission */}
            {gradingSubmission.fileName && (
              <div>
                <Label>Submitted File</Label>
                <div className="mt-2 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span>{gradingSubmission.fileName}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Quiz Answers */}
            {gradingSubmission.answers && (
              <div>
                <Label>Quiz Answers</Label>
                <div className="mt-2 space-y-4">
                  {gradingSubmission.answers.map((qa, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-sm mb-2">
                        <strong>Q{index + 1}:</strong> {qa.question}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Answer:</strong> {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grade Input */}
            <div>
              <Label htmlFor="grade">Grade (out of 100)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="100"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="Enter grade"
                className="mt-2"
              />
            </div>

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Provide feedback to the student..."
                className="mt-2"
                rows={5}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSaveGrade} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Grade
              </Button>
              <Button
                variant="outline"
                onClick={() => setGradingSubmission(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submissions View
  if (viewingAssignment) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => setViewingAssignment(null)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl mb-2">{viewingAssignment.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Course: {viewingAssignment.course}</span>
            <span>•</span>
            <span>Due: {new Date(viewingAssignment.dueDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>
              {viewingAssignment.submissions} / {viewingAssignment.totalStudents} submissions
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.studentName}</TableCell>
                    <TableCell>{submission.studentId}</TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                    <TableCell>
                      {submission.grade !== undefined ? (
                        <span>{submission.grade}/100</span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.status === "graded" ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200">
                          Graded
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartGrading(submission)}
                      >
                        {submission.status === "graded" ? "Review" : "Grade"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Assignment List View
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Assignments</h1>
          <p className="text-gray-600">Create, view, and grade assignments</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Assignment
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-assignment-title">Assignment Title</Label>
                <Input
                  id="new-assignment-title"
                  placeholder="e.g., Week 3 Programming Exercise"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-assignment-course">Course</Label>
                <Select defaultValue="CS101">
                  <SelectTrigger id="new-assignment-course" className="mt-2">
                    <SelectValue placeholder="Choose course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS101">CS101</SelectItem>
                    <SelectItem value="CS201">CS201</SelectItem>
                    <SelectItem value="CS105">CS105</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-assignment-due-date">Due Date</Label>
                <Input id="new-assignment-due-date" type="date" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="new-assignment-points">Points</Label>
                <Input
                  id="new-assignment-points"
                  type="number"
                  placeholder="100"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-assignment-description">Description</Label>
              <Textarea
                id="new-assignment-description"
                placeholder="Describe the assignment requirements..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={() => setShowCreateForm(false)}>
                Save Assignment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="mb-6">
        <Label htmlFor="course-filter" className="mb-2 block">
          Filter by Course
        </Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger id="course-filter" className="w-64">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="CS101">CS101 - Intro to Computer Science</SelectItem>
            <SelectItem value="CS201">CS201 - Data Structures</SelectItem>
            <SelectItem value="CS105">CS105 - Web Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{assignment.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{assignment.course}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      {assignment.submissions} / {assignment.totalStudents}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingAssignment(assignment)}
                      >
                        View Submissions
                      </Button>
                      <Button variant="outline" size="sm">
                        Grade
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl mb-2">No assignments found</h3>
          <p className="text-gray-600 mb-6">
            {selectedCourse === "all" 
              ? "Get started by creating your first assignment"
              : "No assignments for this course yet"}
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Create Assignment
          </Button>
        </div>
      )}
    </div>
  );
}
