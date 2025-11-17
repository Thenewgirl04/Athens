/**
 * API service layer for making HTTP requests to the backend.
 */

const API_BASE_URL = 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
  studentId?: string;
  avatarUrl?: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User | null;
  token: string | null;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  avatarUrl?: string;
  major: string;
  yearLevel: string;
  department: string;
  advisor: string;
  gpa: number;
  credits: number;
  enrolledCourses: string[];
  completedAssignments: Array<{
    assignmentId: string;
    courseId: string;
    score: number;
    submittedAt: string;
  }>;
  quizAttempts: Array<{
    quizId: string;
    courseId: string;
    score: number;
    maxScore: number;
    attemptedAt: string;
    answers: Record<string, any>;
  }>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  thumbnail?: string;
  modules: Array<{
    id: string;
    title: string;
    order: number;
  }>;
  assignments: string[];
  quizzes: string[];
  progress?: number;
  enrollmentDate?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  type: string;
  submitted?: boolean;
  score?: number;
  submittedAt?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options?: string[];
    correctAnswer?: number;
  }>;
  maxScore: number;
  timeLimit: number;
  attempts?: Array<{
    quizId: string;
    courseId: string;
    score: number;
    maxScore: number;
    attemptedAt: string;
    answers: Record<string, any>;
  }>;
  bestScore?: number;
}

// Pretest interfaces
export interface PretestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topicId?: string;
  topicTitle?: string;
}

export interface Pretest {
  id: string;
  courseId: string;
  questions: PretestQuestion[];
  createdAt: string;
  maxScore: number;
}

export interface PretestAttempt {
  id: string;
  studentId: string;
  courseId: string;
  pretestId: string;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
}

export interface TopicPerformance {
  topicId: string;
  topicTitle: string;
  questionsCount: number;
  correctCount: number;
  percentage: number;
  performanceLevel: 'strong' | 'moderate' | 'weak';
}

export interface PretestAnalysis {
  overallScore: number;
  maxScore: number;
  percentage: number;
  performanceLevel: 'fail' | 'below_moderate' | 'moderate_plus';
  topicBreakdown: TopicPerformance[];
  strengths: string[];
  weaknesses: string[];
}

export interface TopicRecommendation {
  topicId: string;
  topicTitle: string;
  recommendation: string;
  resourceUrl: string;
  resourceType: 'article' | 'video' | 'pdf' | 'course';
}

export interface PretestResultResponse {
  attempt: PretestAttempt;
  analysis: PretestAnalysis;
  recommendation?: TopicRecommendation;
}

export interface PretestStatus {
  courseId: string;
  studentId: string;
  completed: boolean;
}

// Curriculum interfaces
export interface CurriculumResource {
  url: string;
  type: string;
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  resources?: CurriculumResource[];
}

export interface CurriculumWeek {
  week_number: number;
  title: string;
  topics: CurriculumTopic[];
}

export interface CurriculumResponse {
  course_id: string | null;
  success: boolean;
  message: string;
  weeks: CurriculumWeek[];
}

class ApiService {
  private getAuthToken(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token || null;
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Student endpoints
  async getStudentProfile(studentId: string): Promise<{ student: Student }> {
    // Note: Backend endpoint expects student_id as query param
    return this.request<{ student: Student }>(`/api/student/profile?student_id=${studentId}`);
  }

  async getStudentCourses(studentId: string): Promise<Course[]> {
    return this.request<Course[]>(`/api/student/${studentId}/courses`);
  }

  async getStudentAssignments(studentId: string): Promise<Assignment[]> {
    return this.request<Assignment[]>(`/api/student/${studentId}/assignments`);
  }

  async getStudentQuizzes(studentId: string): Promise<Quiz[]> {
    return this.request<Quiz[]>(`/api/student/${studentId}/quizzes`);
  }

  async updateStudentProfile(
    studentId: string,
    updates: Partial<Student>
  ): Promise<{ student: Student }> {
    return this.request<{ student: Student }>(`/api/student/${studentId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Pretest endpoints
  async getPretest(courseId: string): Promise<Pretest> {
    return this.request<Pretest>(`/api/pretest/${courseId}`);
  }

  async submitPretest(
    studentId: string,
    courseId: string,
    pretestId: string,
    answers: Record<string, number>
  ): Promise<PretestResultResponse> {
    return this.request<PretestResultResponse>('/api/pretest/submit', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        courseId,
        pretestId,
        answers,
      }),
    });
  }

  async getPretestStatus(courseId: string, studentId: string): Promise<PretestStatus> {
    return this.request<PretestStatus>(`/api/pretest/${courseId}/status/${studentId}`);
  }

  async getPretestResults(courseId: string, studentId: string): Promise<PretestResultResponse> {
    return this.request<PretestResultResponse>(`/api/pretest/${courseId}/results/${studentId}`);
  }

  // Curriculum endpoints
  async getCurriculum(courseId: string): Promise<CurriculumResponse> {
    return this.request<CurriculumResponse>(`/api/curriculum/${courseId}`);
  }
}

export const api = new ApiService();

