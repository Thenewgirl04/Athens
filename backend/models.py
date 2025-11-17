"""
Pydantic models for request and response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class CurriculumGenerationRequest(BaseModel):
    """Request schema for curriculum generation."""
    
    course_id: str = Field(..., description="Unique identifier for the course")
    syllabus_content: Optional[str] = Field(None, description="Content from uploaded syllabus file (processed in-memory, discarded after)")
    course_outline: Optional[str] = Field(None, description="Rough outline text pasted by user")
    number_of_weeks: int = Field(..., description="Number of weeks for the course", gt=0, le=52)
    include_study_materials: bool = Field(True, description="Include study materials in generation")
    include_media_links: bool = Field(True, description="Include media links (YouTube, documentation, etc.)")
    ai_engine: str = Field("gemini", description="AI engine to use (gemini)")


class Resource(BaseModel):
    """Represents a learning resource with type classification."""
    
    url: str
    type: str = Field(..., description="Resource type: 'article', 'video', 'pdf', or 'course'")


class Topic(BaseModel):
    """Represents a topic/lesson within a week."""
    
    id: str
    title: str
    description: str
    resources: Optional[List[Resource]] = Field(default=None, description="Learning resources with type classification")


class Week(BaseModel):
    """Represents a week in the curriculum."""
    
    week_number: int
    title: str
    topics: List[Topic] = Field(default_factory=list)


class CurriculumGenerationResponse(BaseModel):
    """Response schema for curriculum generation."""
    
    course_id: Optional[str] = Field(default=None, description="Course identifier the curriculum belongs to")
    success: bool
    message: str
    weeks: List[Week] = Field(default_factory=list)


class HealthCheckResponse(BaseModel):
    """Health check response."""
    
    status: str
    message: str


# Lesson Note Generation Models

class LessonSection(BaseModel):
    """A section within lesson notes."""
    
    section_type: str = Field(..., description="Section type: 'introduction', 'explanation', 'example', 'activity', 'summary'")
    title: str
    content: str


class LessonNote(BaseModel):
    """Detailed lesson notes for a topic."""
    
    topic_id: str
    topic_title: str
    sections: List[LessonSection]
    estimated_duration: Optional[str] = Field(None, description="e.g., '45 minutes'")


class Lesson(BaseModel):
    """Represents a lesson/module with its notes."""
    
    id: str
    topic_id: str
    course_id: str
    title: str
    notes: LessonNote
    created_at: str
    type: str = Field(default="generated_notes", description="To distinguish from uploaded materials")


class LessonGenerationRequest(BaseModel):
    """Request to generate lesson notes for a topic."""
    
    course_id: str = Field(..., description="Course identifier")
    topic_id: str = Field(..., description="Topic identifier")
    topic_title: str = Field(..., description="Topic title")
    topic_description: str = Field(..., description="Topic description")


class LessonGenerationResponse(BaseModel):
    """Response from lesson note generation."""
    
    success: bool
    message: str
    lesson: Optional[Lesson] = None


# Student Database Models

class CompletedAssignment(BaseModel):
    """Represents a completed assignment submission."""
    assignmentId: str
    courseId: str
    score: float
    submittedAt: str


class QuizAttempt(BaseModel):
    """Represents a quiz attempt by a student."""
    quizId: str
    courseId: str
    score: float
    maxScore: float
    attemptedAt: str
    answers: dict


class Student(BaseModel):
    """Student profile model."""
    id: str
    firstName: str
    lastName: str
    email: str
    password: str  # Hashed password
    studentId: str
    avatarUrl: Optional[str] = None
    major: str
    yearLevel: str
    department: str
    advisor: str
    gpa: float
    credits: int
    enrolledCourses: List[str] = Field(default_factory=list)
    completedAssignments: List[CompletedAssignment] = Field(default_factory=list)
    quizAttempts: List[QuizAttempt] = Field(default_factory=list)
    grades: List[dict] = Field(default_factory=list)


class Teacher(BaseModel):
    """Teacher profile model."""
    id: str
    firstName: str
    lastName: str
    email: str
    password: str  # Hashed password
    department: str
    courses: List[str] = Field(default_factory=list)


class CourseModule(BaseModel):
    """Course module/topic."""
    id: str
    title: str
    order: int


class Course(BaseModel):
    """Course model."""
    id: str
    title: str
    description: str
    instructor: str
    instructorId: str
    thumbnail: Optional[str] = None
    modules: List[CourseModule] = Field(default_factory=list)
    assignments: List[str] = Field(default_factory=list)
    quizzes: List[str] = Field(default_factory=list)


class Enrollment(BaseModel):
    """Student-course enrollment."""
    studentId: str
    courseId: str
    enrolledAt: str
    progress: int  # Percentage 0-100


class Assignment(BaseModel):
    """Assignment model."""
    id: str
    courseId: str
    title: str
    description: str
    dueDate: str
    points: int
    type: str  # "assignment", "project", etc.


class QuizQuestion(BaseModel):
    """Quiz question model."""
    id: str
    question: str
    type: str  # "multiple_choice", "true_false", etc.
    options: Optional[List[str]] = None
    correctAnswer: Optional[int] = None


class Quiz(BaseModel):
    """Quiz model."""
    id: str
    courseId: str
    title: str
    description: str
    questions: List[QuizQuestion] = Field(default_factory=list)
    maxScore: int
    timeLimit: int  # Minutes


class Submission(BaseModel):
    """Student submission for an assignment."""
    id: str
    studentId: str
    assignmentId: str
    courseId: str
    submittedAt: str
    score: Optional[float] = None
    fileUrl: Optional[str] = None
    feedback: Optional[str] = None


# Authentication Models

class LoginRequest(BaseModel):
    """Login request model."""
    email: str
    password: str


class AuthResponse(BaseModel):
    """Authentication response model."""
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None  # Simple token simulation


# Student API Response Models

class StudentProfileResponse(BaseModel):
    """Student profile response."""
    student: Student


class StudentCourseResponse(BaseModel):
    """Student course with progress."""
    course: Course
    progress: int
    enrollmentDate: str


class StudentAssignmentResponse(BaseModel):
    """Student assignment with submission status."""
    assignment: Assignment
    submitted: bool
    score: Optional[float] = None
    submittedAt: Optional[str] = None


class StudentQuizResponse(BaseModel):
    """Student quiz with attempt history."""
    quiz: Quiz
    attempts: List[QuizAttempt]
    bestScore: Optional[float] = None