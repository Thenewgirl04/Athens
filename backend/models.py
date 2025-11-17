"""
Pydantic models for request and response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict


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
    topic_id: str = Field(default="miscellaneous", description="Topic ID or 'miscellaneous' for unassigned lessons")
    course_id: str
    title: str
    notes: Optional[LessonNote] = Field(None, description="Structured notes for AI-generated or manual rich text lessons")
    created_at: str
    type: str = Field(default="ai_generated", description="Lesson type: 'ai_generated', 'manual_rich_text', 'file_pdf', 'file_video', 'file_document', 'link'")
    file_url: Optional[str] = Field(None, description="URL/path for file-based lessons")
    file_size: Optional[str] = Field(None, description="File size for file-based lessons")
    external_url: Optional[str] = Field(None, description="External URL for link-type lessons")


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


# Manual Lesson Creation Models

class LessonCreateRequest(BaseModel):
    """Request to create a manual lesson."""
    
    course_id: str = Field(..., description="Course identifier")
    title: str = Field(..., description="Lesson title")
    topic_id: Optional[str] = Field(default="miscellaneous", description="Topic ID from curriculum or 'miscellaneous'")
    content_type: str = Field(..., description="Content type: 'manual_rich_text', 'file_pdf', 'file_video', 'file_document', 'link'")
    # For rich text lessons
    sections: Optional[List[LessonSection]] = Field(None, description="Structured sections for rich text lessons")
    estimated_duration: Optional[str] = Field(None, description="Estimated duration for rich text lessons")
    # For link lessons
    external_url: Optional[str] = Field(None, description="External URL for link-type lessons")


class LessonUpdateRequest(BaseModel):
    """Request to update an existing lesson."""
    
    title: Optional[str] = None
    topic_id: Optional[str] = None
    sections: Optional[List[LessonSection]] = None
    estimated_duration: Optional[str] = None
    external_url: Optional[str] = None


class LessonCreateResponse(BaseModel):
    """Response from lesson creation."""
    
    success: bool
    message: str
    lesson: Optional[Lesson] = None


class TopicWithLessons(BaseModel):
    """Topic with its associated lessons."""
    
    topic_id: str
    topic_title: str
    topic_description: Optional[str] = None
    week_number: Optional[int] = None
    week_title: Optional[str] = None
    lessons: List[Lesson] = Field(default_factory=list)


class LessonsByTopicResponse(BaseModel):
    """Response containing lessons grouped by topics."""
    
    course_id: str
    topics: List[TopicWithLessons] = Field(default_factory=list)


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


# Pretest Models

class PretestQuestion(BaseModel):
    """Pretest question model."""
    id: str
    question: str
    options: List[str] = Field(..., description="List of 4 multiple choice options")
    correctAnswer: int = Field(..., description="Index of correct answer (0-3)")
    topicId: Optional[str] = Field(None, description="Topic ID from curriculum this question relates to")
    topicTitle: Optional[str] = Field(None, description="Topic title for analysis")


class Pretest(BaseModel):
    """Pretest model for a course."""
    id: str
    courseId: str
    questions: List[PretestQuestion] = Field(default_factory=list)
    createdAt: str
    maxScore: int


class PretestAttempt(BaseModel):
    """Student's pretest attempt."""
    id: str
    studentId: str
    courseId: str
    pretestId: str
    answers: Dict[str, int] = Field(..., description="Question ID -> selected answer index")
    score: float
    maxScore: float
    percentage: float
    completedAt: str


class TopicPerformance(BaseModel):
    """Performance breakdown for a specific topic."""
    topicId: str
    topicTitle: str
    questionsCount: int
    correctCount: int
    percentage: float
    performanceLevel: str = Field(..., description="'strong', 'moderate', or 'weak'")


class PretestAnalysis(BaseModel):
    """SAT-style performance analysis."""
    overallScore: float
    maxScore: float
    percentage: float
    performanceLevel: str = Field(..., description="'fail' (0-69%), 'below_moderate' (70-84%), 'moderate_plus' (85-100%)")
    topicBreakdown: List[TopicPerformance]
    strengths: List[str] = Field(default_factory=list, description="Topics where student performed well")
    weaknesses: List[str] = Field(default_factory=list, description="Topics where student needs improvement")


class TopicRecommendation(BaseModel):
    """Resource recommendation for a weak topic area."""
    topicId: str
    topicTitle: str
    recommendation: str = Field(..., description="Explanation of why this topic needs attention")
    resourceUrl: str
    resourceType: str = Field(..., description="'article', 'video', 'pdf', or 'course'")


class PretestSubmissionRequest(BaseModel):
    """Request to submit pretest answers."""
    studentId: str
    courseId: str
    pretestId: str
    answers: Dict[str, int] = Field(..., description="Question ID -> selected answer index")


class PretestResultResponse(BaseModel):
    """Complete pretest result with analysis and recommendations."""
    attempt: PretestAttempt
    analysis: PretestAnalysis
    recommendation: Optional[TopicRecommendation] = Field(None, description="Only present if score < 85%")