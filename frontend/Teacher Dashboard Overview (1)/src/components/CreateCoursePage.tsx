import { useState } from "react";
import {
  Upload,
  Plus,
  X,
  Save,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";

interface Lesson {
  id: string;
  title: string;
  description: string;
  materialType: "pdf" | "video" | "link" | "";
  materialUrl?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
}

export function CreateCoursePage() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<string>("");

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState<Lesson>({
    id: "",
    title: "",
    description: "",
    materialType: "",
  });

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Assignment>({
    id: "",
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
  });

  // Enrollment options
  const [allowSelfEnroll, setAllowSelfEnroll] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState("");

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddLesson = () => {
    if (newLesson.title) {
      setLessons([...lessons, { ...newLesson, id: Date.now().toString() }]);
      setNewLesson({
        id: "",
        title: "",
        description: "",
        materialType: "",
      });
      setShowAddLesson(false);
    }
  };

  const handleRemoveLesson = (id: string) => {
    setLessons(lessons.filter((lesson) => lesson.id !== id));
  };

  const handleAddAssignment = () => {
    if (newAssignment.title) {
      setAssignments([
        ...assignments,
        { ...newAssignment, id: Date.now().toString() },
      ]);
      setNewAssignment({
        id: "",
        title: "",
        description: "",
        dueDate: "",
        maxMarks: 100,
      });
      setShowAddAssignment(false);
    }
  };

  const handleRemoveAssignment = (id: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
  };

  const handleCreateCourse = () => {
    // In a real app, this would make an API call
    console.log("Creating course...", {
      courseTitle,
      courseCode,
      description,
      department,
      semester,
      startDate,
      endDate,
      lessons,
      assignments,
      allowSelfEnroll,
      enrollmentType,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft...");
    alert("Course saved as draft!");
  };

  const getMaterialIcon = (type: Lesson["materialType"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-purple-600" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "link":
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Create New Course</h1>
        <p className="text-gray-600">
          Set up your new course details and upload resources.
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Your course has been created successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Course Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>🧾 Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Course Title & Course Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course-title">
                  Course Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-title"
                  placeholder="e.g., Introduction to Cybersecurity"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-code">
                  Course Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-code"
                  placeholder="e.g., CS401"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief summary of the course..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Row 3: Department & Semester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Choose department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="arts">Arts & Humanities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester / Term</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall-2025">Fall 2025</SelectItem>
                    <SelectItem value="spring-2026">Spring 2026</SelectItem>
                    <SelectItem value="summer-2026">Summer 2026</SelectItem>
                    <SelectItem value="fall-2026">Fall 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: Course Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Course Thumbnail</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload an image or banner for the course
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  PNG, JPG up to 5MB
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
                {thumbnailFile && (
                  <p className="text-sm text-gray-700 mt-3">
                    Selected: {thumbnailFile}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Content Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>📚 Course Modules / Lessons</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowAddLesson(!showAddLesson)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson / Module
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Lesson Form */}
            {showAddLesson && (
              <Card className="border-2 border-blue-200 bg-blue-50/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title">Lesson Title</Label>
                    <Input
                      id="lesson-title"
                      placeholder="e.g., Introduction to Variables"
                      value={newLesson.title}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lesson-description">Description</Label>
                    <Textarea
                      id="lesson-description"
                      placeholder="Brief description of the lesson..."
                      rows={3}
                      value={newLesson.description}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material-type">Material Type</Label>
                    <Select
                      value={newLesson.materialType}
                      onValueChange={(value: Lesson["materialType"]) =>
                        setNewLesson({ ...newLesson, materialType: value })
                      }
                    >
                      <SelectTrigger id="material-type">
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newLesson.materialType && (
                    <div className="space-y-2">
                      <Label>Upload Material</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <Button variant="outline" size="sm">
                          {newLesson.materialType === "link"
                            ? "Add Link"
                            : "Choose File"}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddLesson}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Lesson
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddLesson(false);
                        setNewLesson({
                          id: "",
                          title: "",
                          description: "",
                          materialType: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lessons List */}
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <Card key={lesson.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getMaterialIcon(lesson.materialType)}
                            <h4 className="font-medium">{lesson.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {lesson.materialType?.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {expandedLesson === lesson.id && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm text-gray-600">
                                {lesson.description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedLesson(
                                expandedLesson === lesson.id ? null : lesson.id
                              )
                            }
                          >
                            {expandedLesson === lesson.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLesson(lesson.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No lessons added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignments & Quizzes Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🧮 Assignments & Quizzes</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowAddAssignment(!showAddAssignment)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment or Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Assignment Form */}
            {showAddAssignment && (
              <Card className="border-2 border-purple-200 bg-purple-50/30">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-title">Assignment Title</Label>
                    <Input
                      id="assignment-title"
                      placeholder="e.g., Week 1 Programming Assignment"
                      value={newAssignment.title}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment-description">Description</Label>
                    <Textarea
                      id="assignment-description"
                      placeholder="Assignment details and requirements..."
                      rows={3}
                      value={newAssignment.description}
                      onChange={(e) =>
                        setNewAssignment({
                          ...newAssignment,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newAssignment.dueDate}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-marks">Max Marks</Label>
                      <Input
                        id="max-marks"
                        type="number"
                        placeholder="100"
                        value={newAssignment.maxMarks}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            maxMarks: parseInt(e.target.value) || 100,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload File / Add Questions</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <Button variant="outline" size="sm">
                        Upload Assignment Files
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddAssignment}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Assignment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddAssignment(false);
                        setNewAssignment({
                          id: "",
                          title: "",
                          description: "",
                          dueDate: "",
                          maxMarks: 100,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments List */}
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            {assignment.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>Max: {assignment.maxMarks} marks</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No assignments added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Enrollment Section */}
        <Card>
          <CardHeader>
            <CardTitle>👨‍🎓 Enrollment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="self-enroll"
                checked={allowSelfEnroll}
                onCheckedChange={(checked) =>
                  setAllowSelfEnroll(checked as boolean)
                }
              />
              <Label
                htmlFor="self-enroll"
                className="cursor-pointer"
              >
                Allow students to self-enroll
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollment-type">Select Enrollment Type</Label>
              <Select
                value={enrollmentType}
                onValueChange={setEnrollmentType}
              >
                <SelectTrigger id="enrollment-type">
                  <SelectValue placeholder="Choose enrollment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="invite-only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Student List (CSV)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file with student emails
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Save / Publish Section */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <Button variant="outline" onClick={() => window.history.back()}>
            Discard
          </Button>
          <Button variant="outline" onClick={handleSaveAsDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={handleCreateCourse} size="lg">
            <CheckCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>
    </div>
  );
}
