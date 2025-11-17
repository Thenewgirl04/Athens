import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  X,
  MessageSquare,
  Eye,
  CheckCircle,
  Video,
  Link as LinkIcon,
  File,
  Sparkles,
  Loader2,
  ExternalLink,
  Clock,
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
import { LessonEditor } from "./LessonEditor";

interface Lesson {
  id: string;
  title: string;
  type: string;
  topic_id: string;
  course_id: string;
  created_at: string;
  file_url?: string;
  file_size?: string;
  external_url?: string;
  notes?: {
    sections?: Array<{
      section_type: string;
      title: string;
      content: string;
    }>;
  };
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

interface TopicWithLessons {
  topic_id: string;
  topic_title: string;
  topic_description?: string;
  week_number?: number;
  week_title?: string;
  lessons: Lesson[];
}

interface Topic {
  id: string;
  title: string;
  description?: string;
  week_number?: number;
  week_title?: string;
}

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

// Markdown parser function to convert markdown to HTML
function parseMarkdown(text: string): string {
  if (!text) return "";
  
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  };
  
  // Split into lines for processing
  const lines = text.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a bullet list item
    if (line.match(/^\* (.+)$/)) {
      const listContent = line.replace(/^\* (.+)$/, '$1');
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      // Process bold and italic within list items
      let processedContent = escapeHtml(listContent);
      processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      processedLines.push(`<li>${processedContent}</li>`);
    } else {
      // Close list if we were in one
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      
      // Process regular lines
      if (line) {
        let processedLine = escapeHtml(line);
        // Convert **bold** to <strong>bold</strong> first
        processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Convert *italic* to <em>italic</em> (simple match, avoiding **)
        // Match single * that's not part of **
        processedLine = processedLine.replace(/([^*]|^)\*([^*\n]+?)\*([^*]|$)/g, "$1<em>$2</em>$3");
        processedLines.push(`<p>${processedLine}</p>`);
      } else {
        // Empty line - add paragraph break
        processedLines.push('');
      }
    }
  }
  
  // Close list if still open
  if (inList) {
    processedLines.push('</ul>');
  }
  
  // Join and clean up
  let html = processedLines.join('\n');
  
  // Remove empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/\n\n+/g, '\n');
  
  return html.trim();
}

export function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId: routeCourseId } = useParams<{ courseId?: string }>();
  const location = useLocation();
  const state = location.state as
    | {
        courseName?: string;
        courseCode?: string;
      }
    | undefined;

  const courseId = routeCourseId ?? "course-demo";
  const courseName = state?.courseName ?? "Course Overview";
  const courseCode = state?.courseCode ?? courseId.toUpperCase();
  const [activeSection, setActiveSection] = useState<
    "lessons" | "assignments" | "quizzes" | "students" | "curriculum"
  >("lessons");
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  
  // Lessons state
  const [lessonsByTopic, setLessonsByTopic] = useState<TopicWithLessons[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  
  // Add lesson form state
  const [lessonTitle, setLessonTitle] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("miscellaneous");
  const [lessonType, setLessonType] = useState<string>("manual_rich_text");
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonUrl, setLessonUrl] = useState("");
  const [showRichTextEditor, setShowRichTextEditor] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [selectedTopicForGeneration, setSelectedTopicForGeneration] = useState<string>("");
  const [selectedLessonForView, setSelectedLessonForView] = useState<Lesson | null>(null);
  const [loadingLessonDetails, setLoadingLessonDetails] = useState(false);
  
  // Fetch full lesson details when viewing
  const handleViewLesson = async (lesson: Lesson) => {
    setLoadingLessonDetails(true);
    setSelectedLessonForView(null); // Clear previous lesson
    try {
      // Fetch full lesson details from API
      const resp = await fetch(`/api/lesson/${lesson.id}?course_id=${lesson.course_id}`);
      if (resp.ok) {
        const fullLesson = await resp.json();
        console.log("Fetched lesson details:", fullLesson);
        setSelectedLessonForView(fullLesson);
      } else {
        // If fetch fails, use the lesson data we already have
        console.warn("Failed to fetch full lesson details, using available data:", lesson);
        setSelectedLessonForView(lesson);
      }
    } catch (err) {
      console.error("Error fetching lesson details:", err);
      // Use the lesson data we already have
      console.log("Using lesson data from list:", lesson);
      setSelectedLessonForView(lesson);
    } finally {
      setLoadingLessonDetails(false);
    }
  };

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
      if (!resp.ok) {
        let errorMsg = `Failed to fetch curriculum (${resp.status})`;
        try {
          const errorData = await resp.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          const errorText = await resp.text();
          if (errorText && !errorText.startsWith('<!DOCTYPE')) {
            errorMsg = errorText.substring(0, 100);
          }
        }
        throw new Error(errorMsg);
      }
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

  // Fetch lessons from API
  const fetchLessons = async () => {
    setLessonsLoading(true);
    setLessonsError(null);
    try {
      const resp = await fetch(`/api/lessons/by-topic/${courseId}`);
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Failed to fetch lessons: ${errorText.substring(0, 100)}`);
      }
      const data = await resp.json();
      setLessonsByTopic(data.topics || []);
    } catch (err: any) {
      setLessonsError(err.message || "Error fetching lessons");
      setLessonsByTopic([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Fetch topics from API
  const fetchTopics = async () => {
    try {
      const resp = await fetch(`/api/topics/${courseId}`);
      if (!resp.ok) throw new Error("Failed to fetch topics");
      const data = await resp.json();
      setTopics(data || []);
    } catch (err: any) {
      console.error("Error fetching topics:", err);
      setTopics([]);
    }
  };

  // Load lessons and topics when lessons section is active
  useEffect(() => {
    if (activeSection === "lessons") {
      fetchLessons();
      fetchTopics();
    }
  }, [activeSection, courseId]);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "ai_generated":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "file_video":
        return <Video className="h-4 w-4 text-purple-600" />;
      case "file_pdf":
        return <File className="h-4 w-4 text-red-600" />;
      case "link":
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      case "file_document":
      case "manual_rich_text":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case "ai_generated":
        return "AI Generated";
      case "file_video":
        return "Video";
      case "file_pdf":
        return "PDF";
      case "link":
        return "Link";
      case "file_document":
        return "Document";
      case "manual_rich_text":
        return "Rich Text";
      default:
        return "Lesson";
    }
  };

  // Handle manual lesson creation
  const handleCreateManualLesson = async (
    sections: Array<{ section_type: string; title: string; content: string }>,
    estimatedDuration: string
  ) => {
    try {
      const resp = await fetch("/api/lessons/manual/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          title: lessonTitle,
          topic_id: selectedTopicId,
          content_type: "manual_rich_text",
          sections: sections,
          estimated_duration: estimatedDuration,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to create lesson");
      }

      setShowAddLesson(false);
      setShowRichTextEditor(false);
      setLessonTitle("");
      setSelectedTopicId("miscellaneous");
      fetchLessons();
    } catch (err: any) {
      alert(err.message || "Error creating lesson");
    }
  };

  // Handle file lesson creation
  const handleCreateFileLesson = async () => {
    if (!lessonFile) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("title", lessonTitle);
      formData.append("topic_id", selectedTopicId);
      formData.append("content_type", lessonType);
      formData.append("file", lessonFile);

      const resp = await fetch("/api/lessons/file/create", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to create file lesson");
      }

      setShowAddLesson(false);
      setLessonTitle("");
      setLessonFile(null);
      setSelectedTopicId("miscellaneous");
      fetchLessons();
    } catch (err: any) {
      alert(err.message || "Error creating file lesson");
    }
  };

  // Handle link lesson creation
  const handleCreateLinkLesson = async () => {
    if (!lessonUrl) {
      alert("Please enter a URL");
      return;
    }

    try {
      const resp = await fetch("/api/lessons/manual/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          title: lessonTitle,
          topic_id: selectedTopicId,
          content_type: "link",
          external_url: lessonUrl,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to create link lesson");
      }

      setShowAddLesson(false);
      setLessonTitle("");
      setLessonUrl("");
      setSelectedTopicId("miscellaneous");
      fetchLessons();
    } catch (err: any) {
      alert(err.message || "Error creating link lesson");
    }
  };

  // Handle AI lesson generation from topic
  const handleGenerateLessonFromTopic = async () => {
    if (!selectedTopicForGeneration) {
      alert("Please select a topic");
      return;
    }

    setIsGeneratingLesson(true);
    try {
      // Find topic details
      const topic = topics.find((t) => t.id === selectedTopicForGeneration);
      if (!topic) throw new Error("Topic not found");

      const resp = await fetch("/api/lessons/generate-from-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          topic_id: selectedTopicForGeneration,
          topic_title: topic.title,
          topic_description: topic.description || "",
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to generate lesson");
      }

      setSelectedTopicForGeneration("");
      fetchLessons();
      alert("Lesson generated successfully!");
    } catch (err: any) {
      alert(err.message || "Error generating lesson");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Handle lesson deletion
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const resp = await fetch(`/api/lessons/${lessonId}?course_id=${courseId}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to delete lesson");
      }

      fetchLessons();
    } catch (err: any) {
      alert(err.message || "Error deleting lesson");
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
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-4 -ml-3"
          >
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
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerateLessonFromTopic}
                  disabled={isGeneratingLesson || topics.length === 0}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGeneratingLesson ? "Generating..." : "Generate from Topic"}
                </Button>
                <Button onClick={() => setShowAddLesson(!showAddLesson)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </div>
            </div>

            {/* Generate from Topic Dialog */}
            {topics.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="topic-select">Generate AI Lesson from Topic:</Label>
                    <Select
                      value={selectedTopicForGeneration}
                      onValueChange={setSelectedTopicForGeneration}
                    >
                      <SelectTrigger id="topic-select" className="w-64">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.week_title
                              ? `Week ${topic.week_number}: ${topic.title}`
                              : topic.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleGenerateLessonFromTopic}
                      disabled={!selectedTopicForGeneration || isGeneratingLesson}
                    >
                      {isGeneratingLesson ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topic-select-add">Topic</Label>
                    <Select
                      value={selectedTopicId}
                      onValueChange={setSelectedTopicId}
                    >
                      <SelectTrigger id="topic-select-add" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.week_title
                              ? `Week ${topic.week_number}: ${topic.title}`
                              : topic.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Material Type</Label>
                    <Tabs
                      value={lessonType}
                      onValueChange={setLessonType}
                      className="mt-2"
                    >
                      <TabsList>
                        <TabsTrigger value="manual_rich_text">Rich Text</TabsTrigger>
                        <TabsTrigger value="file_video">Video</TabsTrigger>
                        <TabsTrigger value="file_pdf">PDF</TabsTrigger>
                        <TabsTrigger value="file_document">Document</TabsTrigger>
                        <TabsTrigger value="link">Link</TabsTrigger>
                      </TabsList>
                      <TabsContent value="manual_rich_text" className="mt-4">
                        {showRichTextEditor ? (
                          <LessonEditor
                            onSave={handleCreateManualLesson}
                            onCancel={() => setShowRichTextEditor(false)}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setShowRichTextEditor(true)}
                          >
                            Open Rich Text Editor
                          </Button>
                        )}
                      </TabsContent>
                      <TabsContent value="file_video" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload video file
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <label className="cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) =>
                                  setLessonFile(e.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </Button>
                          {lessonFile && (
                            <p className="text-sm text-gray-700 mt-3">
                              Selected: {lessonFile.name}
                            </p>
                          )}
                        </div>
                        <Button
                          className="mt-4"
                          onClick={handleCreateFileLesson}
                          disabled={!lessonFile || !lessonTitle}
                        >
                          Upload Video Lesson
                        </Button>
                      </TabsContent>
                      <TabsContent value="file_pdf" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload PDF document
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <label className="cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) =>
                                  setLessonFile(e.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </Button>
                          {lessonFile && (
                            <p className="text-sm text-gray-700 mt-3">
                              Selected: {lessonFile.name}
                            </p>
                          )}
                        </div>
                        <Button
                          className="mt-4"
                          onClick={handleCreateFileLesson}
                          disabled={!lessonFile || !lessonTitle}
                        >
                          Upload PDF Lesson
                        </Button>
                      </TabsContent>
                      <TabsContent value="file_document" className="mt-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload document
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <label className="cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                accept=".doc,.docx,.txt"
                                className="hidden"
                                onChange={(e) =>
                                  setLessonFile(e.target.files?.[0] || null)
                                }
                              />
                            </label>
                          </Button>
                          {lessonFile && (
                            <p className="text-sm text-gray-700 mt-3">
                              Selected: {lessonFile.name}
                            </p>
                          )}
                        </div>
                        <Button
                          className="mt-4"
                          onClick={handleCreateFileLesson}
                          disabled={!lessonFile || !lessonTitle}
                        >
                          Upload Document Lesson
                        </Button>
                      </TabsContent>
                      <TabsContent value="link" className="mt-4">
                        <Input
                          placeholder="Enter URL (e.g., https://...)"
                          value={lessonUrl}
                          onChange={(e) => setLessonUrl(e.target.value)}
                        />
                        <Button
                          className="mt-4"
                          onClick={handleCreateLinkLesson}
                          disabled={!lessonUrl || !lessonTitle}
                        >
                          Add Link Lesson
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {lessonType !== "manual_rich_text" && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddLesson(false);
                          setLessonTitle("");
                          setLessonFile(null);
                          setLessonUrl("");
                          setSelectedTopicId("miscellaneous");
                          setLessonType("manual_rich_text");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lessons List Grouped by Topics */}
            {lessonsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">Loading lessons...</p>
              </div>
            ) : lessonsError ? (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {lessonsError}
                </AlertDescription>
              </Alert>
            ) : lessonsByTopic.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                  <p className="text-gray-500">
                    Start by generating a lesson from a curriculum topic or adding a manual lesson.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {lessonsByTopic.map((topic) => (
                  <Card key={topic.topic_id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          {topic.week_title && (
                            <span className="text-sm text-gray-500 mr-2">
                              Week {topic.week_number}:
                            </span>
                          )}
                          {topic.topic_title}
                        </div>
                        <Badge variant="outline">
                          {topic.lessons.length} {topic.lessons.length === 1 ? "lesson" : "lessons"}
                        </Badge>
                      </CardTitle>
                      {topic.topic_description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {topic.topic_description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {topic.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{lesson.title}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {getLessonTypeLabel(lesson.type)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                  <span>
                                    Created: {new Date(lesson.created_at).toLocaleDateString()}
                                  </span>
                                  {lesson.file_size && <span>• {lesson.file_size}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {lesson.external_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <a
                                    href={lesson.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Open
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLesson(lesson)}
                                disabled={loadingLessonDetails}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {loadingLessonDetails ? "Loading..." : "View"}
                              </Button>
                              {lesson.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <a
                                    href={`/api/lessons/file/${lesson.course_id}/${lesson.id}/${lesson.file_url.split("/").pop()}`}
                                    target="_blank"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lesson Viewer Dialog */}
        <Dialog open={!!selectedLessonForView} onOpenChange={(open) => {
          if (!open) {
            setSelectedLessonForView(null);
            setLoadingLessonDetails(false);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLessonForView && getLessonIcon(selectedLessonForView.type)}
                {selectedLessonForView?.title || "Lesson"}
              </DialogTitle>
              <DialogDescription>
                {selectedLessonForView && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {getLessonTypeLabel(selectedLessonForView.type || "unknown")}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created: {selectedLessonForView.created_at ? new Date(selectedLessonForView.created_at).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-[200px]">

            {loadingLessonDetails ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">Loading lesson details...</p>
              </div>
            ) : selectedLessonForView ? (
              <div className="mt-4">
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                    <details>
                      <summary className="cursor-pointer font-semibold">Debug: Lesson Data</summary>
                      <pre className="mt-2 overflow-auto max-h-40">
                        {JSON.stringify(selectedLessonForView, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                {/* Render content based on lesson type */}
                {(() => {
                  // Link Lesson
                  if (selectedLessonForView.type === "link" && selectedLessonForView.external_url) {
                    return (
                      <div className="text-center py-8">
                        <LinkIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600 mb-6">
                          This lesson is an external resource. Click the link below to access it.
                        </p>
                        <Button size="lg" className="gap-2" asChild>
                          <a href={selectedLessonForView.external_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-5 h-5" />
                            Open External Link
                          </a>
                        </Button>
                      </div>
                    );
                  }

                  // File Lesson
                  if ((selectedLessonForView.type === "file_pdf" || 
                       selectedLessonForView.type === "file_video" || 
                       selectedLessonForView.type === "file_document") && 
                      selectedLessonForView.file_url) {
                    return (
                      <div className="text-center py-8">
                        <div className="mb-4">{getLessonIcon(selectedLessonForView.type)}</div>
                        <p className="text-gray-600 mb-6">
                          {getLessonTypeLabel(selectedLessonForView.type)} - Click below to download or view
                        </p>
                        <Button size="lg" className="gap-2" asChild>
                          <a
                            href={`/api/lessons/file/${selectedLessonForView.course_id}/${selectedLessonForView.id}/${selectedLessonForView.file_url.split("/").pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-5 h-5" />
                            {selectedLessonForView.type === "file_video" ? "Watch Video" : "Download File"}
                          </a>
                        </Button>
                        {selectedLessonForView.file_size && (
                          <p className="text-sm text-gray-500 mt-4">
                            File size: {selectedLessonForView.file_size}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Structured Content (AI-generated or manual rich text)
                  if (selectedLessonForView.type === "ai_generated" || selectedLessonForView.type === "manual_rich_text") {
                    const sections = selectedLessonForView.notes?.sections;
                    if (sections && Array.isArray(sections) && sections.length > 0) {
                      return (
                        <div className="prose prose-slate max-w-none">
                          {sections.map((section: any, index: number) => (
                            <div key={index} className="mb-8">
                              <h3 className="text-gray-900 mt-6 mb-3 text-xl font-semibold">
                                {section.title || `Section ${index + 1}`}
                              </h3>
                              <div
                                className="text-gray-700 leading-relaxed prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(section.content || "") }}
                              />
                            </div>
                          ))}
                          {selectedLessonForView.notes?.estimated_duration && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Estimated duration: {selectedLessonForView.notes.estimated_duration}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-2">This lesson has no content sections yet.</p>
                          <p className="text-sm">Type: {selectedLessonForView.type}</p>
                          {selectedLessonForView.notes && (
                            <div className="mt-4 p-4 bg-gray-50 rounded text-left">
                              <p className="text-sm font-semibold mb-2">Notes structure:</p>
                              <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-40">
                                {JSON.stringify(selectedLessonForView.notes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    }
                  }

                  // Fallback for unknown types
                  return (
                    <div className="text-center py-8">
                      <div className="mb-4">{getLessonIcon(selectedLessonForView.type)}</div>
                      <p className="text-gray-600 mb-2">Lesson Type: {selectedLessonForView.type || "Unknown"}</p>
                      <div className="mt-4 p-4 bg-gray-50 rounded text-left">
                        <p className="text-sm font-semibold mb-2">Full Lesson Data:</p>
                        <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-60">
                          {JSON.stringify(selectedLessonForView, null, 2)}
                        </pre>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No lesson data available.</p>
                <p className="text-xs mt-2">selectedLessonForView: {selectedLessonForView ? "exists" : "null"}</p>
              </div>
            )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLessonForView(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
