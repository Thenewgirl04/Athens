"""
Database manager for JSON file-based storage.
Handles CRUD operations for students, teachers, courses, enrollments, assignments, quizzes, and submissions.
"""
import json
import os
from pathlib import Path
from typing import Optional, List, Dict, Any, TypeVar, Type
from threading import Lock

T = TypeVar('T')

class DatabaseManager:
    """Manages JSON file-based database operations with file locking."""
    
    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent / "database"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._locks: Dict[str, Lock] = {}
    
    def _get_lock(self, filepath: str) -> Lock:
        """Get or create a lock for a file."""
        if filepath not in self._locks:
            self._locks[filepath] = Lock()
        return self._locks[filepath]
    
    def _load_json(self, filepath: Path) -> List[Dict[str, Any]]:
        """Load JSON data from file."""
        lock = self._get_lock(str(filepath))
        with lock:
            if not filepath.exists():
                return []
            with filepath.open('r', encoding='utf-8') as f:
                return json.load(f)
    
    def _save_json(self, filepath: Path, data: List[Dict[str, Any]]) -> None:
        """Save JSON data to file."""
        lock = self._get_lock(str(filepath))
        with lock:
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with filepath.open('w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Student operations
    def get_all_students(self) -> List[Dict[str, Any]]:
        """Get all students."""
        filepath = self.base_dir / "students" / "students.json"
        return self._load_json(filepath)
    
    def get_student_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get student by ID."""
        students = self.get_all_students()
        return next((s for s in students if s.get("id") == student_id), None)
    
    def get_student_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get student by email."""
        students = self.get_all_students()
        return next((s for s in students if s.get("email") == email), None)
    
    def update_student(self, student_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update student data."""
        filepath = self.base_dir / "students" / "students.json"
        students = self.get_all_students()
        for i, student in enumerate(students):
            if student.get("id") == student_id:
                students[i].update(updates)
                self._save_json(filepath, students)
                return students[i]
        return None
    
    # Teacher operations
    def get_all_teachers(self) -> List[Dict[str, Any]]:
        """Get all teachers."""
        filepath = self.base_dir / "teachers" / "teachers.json"
        return self._load_json(filepath)
    
    def get_teacher_by_id(self, teacher_id: str) -> Optional[Dict[str, Any]]:
        """Get teacher by ID."""
        teachers = self.get_all_teachers()
        return next((t for t in teachers if t.get("id") == teacher_id), None)
    
    def get_teacher_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get teacher by email."""
        teachers = self.get_all_teachers()
        return next((t for t in teachers if t.get("email") == email), None)
    
    # Course operations
    def get_all_courses(self) -> List[Dict[str, Any]]:
        """Get all courses."""
        filepath = self.base_dir / "courses" / "courses.json"
        return self._load_json(filepath)
    
    def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Get course by ID."""
        courses = self.get_all_courses()
        return next((c for c in courses if c.get("id") == course_id), None)
    
    def get_courses_by_ids(self, course_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple courses by IDs."""
        courses = self.get_all_courses()
        return [c for c in courses if c.get("id") in course_ids]
    
    # Enrollment operations
    def get_all_enrollments(self) -> List[Dict[str, Any]]:
        """Get all enrollments."""
        filepath = self.base_dir / "enrollments" / "enrollments.json"
        return self._load_json(filepath)
    
    def get_enrollments_by_student(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all enrollments for a student."""
        enrollments = self.get_all_enrollments()
        return [e for e in enrollments if e.get("studentId") == student_id]
    
    def get_enrollment(self, student_id: str, course_id: str) -> Optional[Dict[str, Any]]:
        """Get specific enrollment."""
        enrollments = self.get_all_enrollments()
        return next((e for e in enrollments if e.get("studentId") == student_id and e.get("courseId") == course_id), None)
    
    # Assignment operations
    def get_all_assignments(self) -> List[Dict[str, Any]]:
        """Get all assignments."""
        filepath = self.base_dir / "assignments" / "assignments.json"
        return self._load_json(filepath)
    
    def get_assignment_by_id(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get assignment by ID."""
        assignments = self.get_all_assignments()
        return next((a for a in assignments if a.get("id") == assignment_id), None)
    
    def get_assignments_by_course(self, course_id: str) -> List[Dict[str, Any]]:
        """Get all assignments for a course."""
        assignments = self.get_all_assignments()
        return [a for a in assignments if a.get("courseId") == course_id]
    
    def get_assignments_by_ids(self, assignment_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple assignments by IDs."""
        assignments = self.get_all_assignments()
        return [a for a in assignments if a.get("id") in assignment_ids]
    
    # Quiz operations
    def get_all_quizzes(self) -> List[Dict[str, Any]]:
        """Get all quizzes."""
        filepath = self.base_dir / "quizzes" / "quizzes.json"
        return self._load_json(filepath)
    
    def get_quiz_by_id(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        """Get quiz by ID."""
        quizzes = self.get_all_quizzes()
        return next((q for q in quizzes if q.get("id") == quiz_id), None)
    
    def get_quizzes_by_course(self, course_id: str) -> List[Dict[str, Any]]:
        """Get all quizzes for a course."""
        quizzes = self.get_all_quizzes()
        return [q for q in quizzes if q.get("courseId") == course_id]
    
    def get_quizzes_by_ids(self, quiz_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple quizzes by IDs."""
        quizzes = self.get_all_quizzes()
        return [q for q in quizzes if q.get("id") in quiz_ids]
    
    # Submission operations
    def get_all_submissions(self) -> List[Dict[str, Any]]:
        """Get all submissions."""
        filepath = self.base_dir / "submissions" / "submissions.json"
        return self._load_json(filepath)
    
    def get_submissions_by_student(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all submissions for a student."""
        submissions = self.get_all_submissions()
        return [s for s in submissions if s.get("studentId") == student_id]
    
    def get_submission_by_assignment(self, student_id: str, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Get submission for a specific assignment."""
        submissions = self.get_all_submissions()
        return next((s for s in submissions if s.get("studentId") == student_id and s.get("assignmentId") == assignment_id), None)

