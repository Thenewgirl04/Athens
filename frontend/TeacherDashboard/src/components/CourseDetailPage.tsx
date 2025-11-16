import React from "react";
import { useState, useEffect, useMemo } from "react";
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
  Sparkles,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";

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
    "lessons" | "assignments" | "quizzes" | "students" | "curriculum"
  >("lessons");
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  // Generate Curriculum Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string>("");
  const [pastedOutline, setPastedOutline] = useState("");
  const [includeStudyMaterials, setIncludeStudyMaterials] = useState(true);
  const [includeMediaLinks, setIncludeMediaLinks] = useState(true);
  const [includeQuizzesAssignments, setIncludeQuizzesAssignments] = useState(true);
  const [aiEngine, setAiEngine] = useState("openai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Curriculum section logic
  interface CurriculumResource {
    url: string;
    type?: string;
  }

  interface CurriculumTopic {
    id: string;
    title: string;
    description: string;
    resources: CurriculumResource[];
  }

  interface CurriculumWeek {
    weekNumber: number;
    title: string;
    topics: CurriculumTopic[];
  }

  const [curriculum, setCurriculum] = useState<CurriculumWeek[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);

  const DEFAULT_CURRICULUM_WEEKS = useMemo(() => 12, []);

  async function handleSyllabusUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setSyllabusFile(null);
      setSyllabusFileName("");
      return;
    }
    setSyllabusFile(file);
    setSyllabusFileName(file.name);
  }

  const normalizeResource = (resource: any): CurriculumResource | null => {
    if (!resource) return null;
    if (typeof resource === "string") {
      return {
        url: resource,
        type: inferResourceType(resource),
      };
    }
    if (typeof resource === "object" && resource.url) {
      return {
        url: resource.url,
        type: resource.type || inferResourceType(resource.url),
      };
    }
    return null;
  };

  const inferResourceType = (url: string): string => {
    const value = url.toLowerCase();
    if (/(youtube\.com|youtu\.be|vimeo\.com)/.test(value)) return "video";
    if (value.endsWith(".pdf")) return "pdf";
    if (/(coursera\.org|edx\.org|udemy\.com|khanacademy\.org)/.test(value)) return "course";
    if (/(github\.com|gist\.github\.com)/.test(value)) return "code";
    return "article";
  };

  // Fetch curriculum from backend
  async function fetchCurriculum() {
    setCurriculumLoading(true);
    setCurriculumError(null);
    try {
      const resp = await fetch(`/api/curriculum/${courseId}`);
      if (resp.status === 404) {
        setCurriculum([]);
        setCurriculumError(null);
        return;
      }
      if (!resp.ok) throw new Error("Failed to fetch curriculum");
      const data = await resp.json();
      const formatted: CurriculumWeek[] = (data.weeks || []).map((week: any) => ({
        weekNumber: week.week_number,
        title: week.title,
        topics: (week.topics || []).map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          description: topic.description || "",
          resources: (topic.resources || [])
            .map((resource: any) => normalizeResource(resource))
            .filter((resource: CurriculumResource | null): resource is CurriculumResource => Boolean(resource)),
        })),
      }));
      setCurriculum(formatted);
    } catch (err: any) {
      setCurriculum([]);
      setCurriculumError(err.message || "Error fetching curriculum");
    } finally {
      setCurriculumLoading(false);
    }
  }

  // Trigger fetch after curriculum generation or on curriculum tab click
  useEffect(() => {
    if (activeSection === "curriculum") {
      fetchCurriculum();
    }
  }, [activeSection]);

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

  // Generate curriculum via AI and refresh
  const handleGenerateCurriculum = async () => {
    setIsGenerating(true);
    setCurriculumError(null);
    try {
      const url = "/api/curriculum/generate";
      const hasFile = !!syllabusFile;

      const fetchOptions: RequestInit = { method: "POST" };

      if (hasFile) {
        const formData = new FormData();
        formData.append("course_id", courseId);
        formData.append("number_of_weeks", String(DEFAULT_CURRICULUM_WEEKS));
        formData.append("include_study_materials", String(includeStudyMaterials));
        formData.append("include_media_links", String(includeMediaLinks));
        formData.append("ai_engine", aiEngine);
        if (pastedOutline) formData.append("course_outline", pastedOutline);
        formData.append("syllabus_file", syllabusFile);
        fetchOptions.body = formData;
      } else {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = JSON.stringify({
          course_id: courseId,
          syllabus_content: null,
          course_outline: pastedOutline || null,
          number_of_weeks: DEFAULT_CURRICULUM_WEEKS,
          include_study_materials: includeStudyMaterials,
          include_media_links: includeMediaLinks,
          ai_engine: aiEngine,
        });
      }

      const resp = await fetch(url, fetchOptions);
      if (!resp.ok) {
        let message = "AI generation failed";
        try {
          const err = await resp.json();
          message = err.detail || err.message || message;
        } catch (_) {
          // ignore
        }
        throw new Error(message);
      }
      await resp.json();
      setShowGenerateModal(false);
      setShowSuccess(true);
      fetchCurriculum(); // re-fetch after generation
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setCurriculumError(err.message || "Failed to generate curriculum");
    } finally {
      setIsGenerating(false);
      setSyllabusFile(null);
      setSyllabusFileName("");
      setPastedOutline("");
      setIncludeStudyMaterials(true);
      setIncludeMediaLinks(true);
      setIncludeQuizzesAssignments(true);
    }
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
            onClick={() => setActiveSection("curriculum")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border ${
              activeSection === "curriculum" ? "border-purple-400 bg-purple-50 text-purple-700" : "text-purple-700 hover:bg-purple-50 border-purple-200"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span>Curriculum</span>
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

      {/* Generate Curriculum Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Curriculum for {courseName}
            </DialogTitle>
            <DialogDescription>
              Upload or enter a rough syllabus, and let AI create a complete curriculum for this course.
            </DialogDescription>
          </DialogHeader>

          {isGenerating ? (
            <div className="py-12 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-spin" />
              <p className="text-lg">AI is generating your curriculum. Please wait…</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="syllabus-upload">Upload Syllabus / Outline</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a text, Word, or PDF file
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      Choose File
                      <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleSyllabusUpload} />
                    </label>
                  </Button>
                  {syllabusFileName && (
                    <p className="text-sm text-gray-700 mt-3">
                      Selected: {syllabusFileName}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-300" />
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              {/* Paste Outline */}
              <div className="space-y-2">
                <Label htmlFor="paste-outline">Paste Outline</Label>
                <Textarea
                  id="paste-outline"
                  placeholder="Paste your syllabus or list of topics here..."
                  rows={6}
                  value={pastedOutline}
                  onChange={(e) => setPastedOutline(e.target.value)}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 border-t pt-4">
                <Label>Generation Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="study-materials"
                    checked={includeStudyMaterials}
                    onCheckedChange={(checked) =>
                      setIncludeStudyMaterials(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="study-materials"
                    className="cursor-pointer"
                  >
                    Include Study Materials
                    <span className="text-sm text-gray-500 ml-2">
                      (Generate recommended notes and readings)
                    </span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="media-links"
                    checked={includeMediaLinks}
                    onCheckedChange={(checked) =>
                      setIncludeMediaLinks(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="media-links"
                    className="cursor-pointer"
                  >
                    Include Media Links
                    <span className="text-sm text-gray-500 ml-2">
                      (Fetch YouTube, blog, and OCW resources)
                    </span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quizzes-assignments"
                    checked={includeQuizzesAssignments}
                    onCheckedChange={(checked) =>
                      setIncludeQuizzesAssignments(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="quizzes-assignments"
                    className="cursor-pointer"
                  >
                    Include Quizzes & Assignments
                    <span className="text-sm text-gray-500 ml-2">
                      (Auto-create basic quizzes and assignments)
                    </span>
                  </Label>
                </div>
              </div>

              {/* AI Engine Selection */}
              <div className="space-y-2">
                <Label htmlFor="ai-engine">AI Engine</Label>
                <Select value={aiEngine} onValueChange={setAiEngine}>
                  <SelectTrigger id="ai-engine">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        OpenAI (GPT-4)
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Google Gemini
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCurriculum}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Curriculum
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-8">
        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Your curriculum has been generated and added to the course.
            </AlertDescription>
          </Alert>
        )}

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

        {/* Curriculum Section */}
        {activeSection === "curriculum" && (
          <div>
            <Button
              variant="default"
              size="lg"
              onClick={() => setShowGenerateModal(true)}
              className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" /> Generate Curriculum
            </Button>
            {curriculumError && (
              <div className="mb-6 p-4 rounded bg-red-50 text-red-700 border border-red-200 text-center">{curriculumError}</div>
            )}
            {curriculumLoading ? (
              <div className="p-8 text-center text-lg text-gray-400">Loading curriculum…</div>
            ) : curriculum.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No curriculum available yet.</div>
            ) : (
              <div>
                {curriculum.map((week) => (
                  <div key={week.weekNumber} className="mb-8">
                    <h3 className="font-semibold text-lg mb-3">
                      Week {week.weekNumber}: {week.title}
                    </h3>
                    <div className="space-y-4">
                      {week.topics.map((topic) => (
                        <Card key={topic.id} className="mb-4">
                          <CardHeader>
                            <CardTitle className="text-base">{topic.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {topic.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {topic.description}
                              </p>
                            )}
                            {topic.resources && topic.resources.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4" />
                                  Resources:
                                </h4>
                                <ul className="list-none space-y-1">
                                  {topic.resources.map((resource) => (
                                    <li key={resource.url} className="flex items-center justify-between gap-3">
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                      >
                                        <LinkIcon className="h-3 w-3" />
                                        {resource.url}
                                      </a>
                                      {resource.type && (
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {resource.type}
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
