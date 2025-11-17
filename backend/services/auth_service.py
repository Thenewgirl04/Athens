"""
Authentication service for student and teacher login.
"""
import bcrypt
from typing import Optional, Dict, Any
from storage.database_manager import DatabaseManager


class AuthService:
    """Handles authentication for students and teachers."""
    
    def __init__(self):
        self.db = DatabaseManager()
    
    def authenticate_student(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a student by email and password.
        
        Args:
            email: Student email
            password: Plain text password
            
        Returns:
            Student dict if authenticated, None otherwise
        """
        student = self.db.get_student_by_email(email)
        if not student:
            return None
        
        # Verify password
        hashed_password = student.get("password", "")
        if not bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
            return None
        
        # Return student data without password
        student_data = student.copy()
        student_data.pop("password", None)
        return student_data
    
    def authenticate_teacher(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a teacher by email and password.
        
        Args:
            email: Teacher email
            password: Plain text password
            
        Returns:
            Teacher dict if authenticated, None otherwise
        """
        teacher = self.db.get_teacher_by_email(email)
        if not teacher:
            return None
        
        # Verify password
        hashed_password = teacher.get("password", "")
        if not bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8')):
            return None
        
        # Return teacher data without password
        teacher_data = teacher.copy()
        teacher_data.pop("password", None)
        return teacher_data
    
    def get_student_profile(self, student_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full student profile by ID.
        
        Args:
            student_id: Student ID
            
        Returns:
            Student dict without password
        """
        student = self.db.get_student_by_id(student_id)
        if not student:
            return None
        
        # Return student data without password
        student_data = student.copy()
        student_data.pop("password", None)
        return student_data

