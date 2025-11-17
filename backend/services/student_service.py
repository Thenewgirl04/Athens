"""
Student service for retrieving student-related data.
"""
from typing import List, Dict, Any, Optional
from storage.database_manager import DatabaseManager


class StudentService:
    """Handles student data retrieval and operations."""
    
    def __init__(self):
        self.db = DatabaseManager()
    
    def get_student_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get student by ID (without password)."""
        student = self.db.get_student_by_id(student_id)
        if not student:
            return None
        
        student_data = student.copy()
        student_data.pop("password", None)
        return student_data
    
    def get_student_courses(self, student_id: str) -> List[Dict[str, Any]]:
        """
        Get all courses for a student with enrollment progress.
        
        Returns:
            List of course dicts with added progress and enrollmentDate
        """
        enrollments = self.db.get_enrollments_by_student(student_id)
        courses_data = []
        
        for enrollment in enrollments:
            course_id = enrollment.get("courseId")
            course = self.db.get_course_by_id(course_id)
            if course:
                course_data = course.copy()
                course_data["progress"] = enrollment.get("progress", 0)
                course_data["enrollmentDate"] = enrollment.get("enrolledAt", "")
                courses_data.append(course_data)
        
        return courses_data
    
    def get_student_assignments(self, student_id: str) -> List[Dict[str, Any]]:
        """
        Get all assignments for a student with submission status.
        
        Returns:
            List of assignment dicts with added submitted, score, and submittedAt fields
        """
        student = self.db.get_student_by_id(student_id)
        if not student:
            return []
        
        # Get all courses the student is enrolled in
        enrolled_course_ids = student.get("enrolledCourses", [])
        
        # Get all assignments for enrolled courses
        all_assignments = []
        for course_id in enrolled_course_ids:
            assignments = self.db.get_assignments_by_course(course_id)
            all_assignments.extend(assignments)
        
        # Get completed assignments for this student
        completed_assignments = {
            ca.get("assignmentId"): ca 
            for ca in student.get("completedAssignments", [])
        }
        
        # Enrich assignments with submission status
        enriched_assignments = []
        for assignment in all_assignments:
            assignment_id = assignment.get("id")
            assignment_data = assignment.copy()
            
            if assignment_id in completed_assignments:
                completed = completed_assignments[assignment_id]
                assignment_data["submitted"] = True
                assignment_data["score"] = completed.get("score")
                assignment_data["submittedAt"] = completed.get("submittedAt")
            else:
                assignment_data["submitted"] = False
                assignment_data["score"] = None
                assignment_data["submittedAt"] = None
            
            enriched_assignments.append(assignment_data)
        
        return enriched_assignments
    
    def get_student_quiz_history(self, student_id: str) -> List[Dict[str, Any]]:
        """
        Get all quizzes for a student with attempt history.
        
        Returns:
            List of quiz dicts with added attempts and bestScore fields
        """
        student = self.db.get_student_by_id(student_id)
        if not student:
            return []
        
        # Get all courses the student is enrolled in
        enrolled_course_ids = student.get("enrolledCourses", [])
        
        # Get all quizzes for enrolled courses
        all_quizzes = []
        for course_id in enrolled_course_ids:
            quizzes = self.db.get_quizzes_by_course(course_id)
            all_quizzes.extend(quizzes)
        
        # Get quiz attempts for this student
        quiz_attempts = student.get("quizAttempts", [])
        
        # Group attempts by quiz ID
        attempts_by_quiz: Dict[str, List[Dict[str, Any]]] = {}
        for attempt in quiz_attempts:
            quiz_id = attempt.get("quizId")
            if quiz_id not in attempts_by_quiz:
                attempts_by_quiz[quiz_id] = []
            attempts_by_quiz[quiz_id].append(attempt)
        
        # Enrich quizzes with attempt history
        enriched_quizzes = []
        for quiz in all_quizzes:
            quiz_id = quiz.get("id")
            quiz_data = quiz.copy()
            
            attempts = attempts_by_quiz.get(quiz_id, [])
            quiz_data["attempts"] = attempts
            
            # Calculate best score
            if attempts:
                best_score = max(attempt.get("score", 0) for attempt in attempts)
                quiz_data["bestScore"] = best_score
            else:
                quiz_data["bestScore"] = None
            
            enriched_quizzes.append(quiz_data)
        
        return enriched_quizzes
    
    def update_student_profile(self, student_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update student profile information.
        
        Args:
            student_id: Student ID
            updates: Dict of fields to update (password will be hashed if provided)
            
        Returns:
            Updated student dict without password
        """
        # Don't allow password updates through this method (use separate endpoint)
        updates.pop("password", None)
        
        updated_student = self.db.update_student(student_id, updates)
        if not updated_student:
            return None
        
        student_data = updated_student.copy()
        student_data.pop("password", None)
        return student_data

