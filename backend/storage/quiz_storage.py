"""Persistent storage helpers for weekly quiz data."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

from models import WeeklyQuiz, WeeklyQuizAttempt


class QuizStorage:
    """Minimal JSON file storage for weekly quiz data."""

    def __init__(self, base_dir: Optional[Path] = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent / "database"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _quizzes_file_path(self) -> Path:
        return self.base_dir / "weekly_quizzes" / "weekly_quizzes.json"

    def _attempts_file_path(self) -> Path:
        return self.base_dir / "weekly_quiz_attempts" / "weekly_quiz_attempts.json"

    def save_quiz(self, quiz: WeeklyQuiz) -> None:
        """Save a weekly quiz to storage."""
        filepath = self._quizzes_file_path()
        quizzes = self._load_quizzes()
        
        # Remove existing quiz of same type for this course/week if any
        quizzes = [
            q for q in quizzes 
            if not (
                q.get("courseId") == quiz.courseId and
                q.get("weekNumber") == quiz.weekNumber and
                q.get("quizType") == quiz.quizType
            )
        ]
        
        # Add new quiz
        quizzes.append(quiz.model_dump())
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("w", encoding="utf-8") as f:
            json.dump(quizzes, f, ensure_ascii=False, indent=2)

    def get_quiz(
        self,
        course_id: str,
        week_number: int,
        quiz_type: str
    ) -> Optional[WeeklyQuiz]:
        """Retrieve a specific quiz by course, week, and type."""
        quizzes = self._load_quizzes()
        for quiz_data in quizzes:
            if (
                quiz_data.get("courseId") == course_id and
                quiz_data.get("weekNumber") == week_number and
                quiz_data.get("quizType") == quiz_type
            ):
                return WeeklyQuiz(**quiz_data)
        return None

    def get_quizzes_for_week(
        self,
        course_id: str,
        week_number: int
    ) -> List[WeeklyQuiz]:
        """Get all quizzes for a specific course and week."""
        quizzes = self._load_quizzes()
        result = []
        for quiz_data in quizzes:
            if (
                quiz_data.get("courseId") == course_id and
                quiz_data.get("weekNumber") == week_number
            ):
                result.append(WeeklyQuiz(**quiz_data))
        return result

    def _load_quizzes(self) -> List[Dict[str, Any]]:
        """Load all quizzes from storage."""
        filepath = self._quizzes_file_path()
        if not filepath.exists():
            return []
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)

    def save_attempt(self, attempt: WeeklyQuizAttempt) -> None:
        """Save a quiz attempt to storage."""
        filepath = self._attempts_file_path()
        attempts = self._load_attempts()
        
        # Add new attempt
        attempts.append(attempt.model_dump())
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("w", encoding="utf-8") as f:
            json.dump(attempts, f, ensure_ascii=False, indent=2)

    def get_attempts(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> List[WeeklyQuizAttempt]:
        """Get all quiz attempts for a student in a specific course and week."""
        attempts = self._load_attempts()
        result = []
        for attempt_data in attempts:
            if (
                attempt_data.get("studentId") == student_id and
                attempt_data.get("courseId") == course_id and
                attempt_data.get("weekNumber") == week_number
            ):
                result.append(WeeklyQuizAttempt(**attempt_data))
        return result

    def get_attempt_by_id(self, attempt_id: str) -> Optional[WeeklyQuizAttempt]:
        """Get a specific quiz attempt by ID."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if attempt_data.get("id") == attempt_id:
                return WeeklyQuizAttempt(**attempt_data)
        return None

    def has_completed_main_quiz(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> bool:
        """Check if student has completed the main quiz for a week."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if (
                attempt_data.get("studentId") == student_id and
                attempt_data.get("courseId") == course_id and
                attempt_data.get("weekNumber") == week_number and
                attempt_data.get("quizType") == "main"
            ):
                return True
        return False

    def get_main_quiz_score(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> Optional[float]:
        """Get the main quiz score (percentage) for a student."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if (
                attempt_data.get("studentId") == student_id and
                attempt_data.get("courseId") == course_id and
                attempt_data.get("weekNumber") == week_number and
                attempt_data.get("quizType") == "main"
            ):
                return attempt_data.get("percentage")
        return None

    def get_main_quiz_attempt(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> Optional[WeeklyQuizAttempt]:
        """Get the main quiz attempt for a student."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if (
                attempt_data.get("studentId") == student_id and
                attempt_data.get("courseId") == course_id and
                attempt_data.get("weekNumber") == week_number and
                attempt_data.get("quizType") == "main"
            ):
                return WeeklyQuizAttempt(**attempt_data)
        return None

    def has_completed_dynamic_quiz(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> bool:
        """Check if student has completed the dynamic quiz for a week."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if (
                attempt_data.get("studentId") == student_id and
                attempt_data.get("courseId") == course_id and
                attempt_data.get("weekNumber") == week_number and
                attempt_data.get("quizType") == "dynamic"
            ):
                return True
        return False

    def _load_attempts(self) -> List[Dict[str, Any]]:
        """Load all quiz attempts from storage."""
        filepath = self._attempts_file_path()
        if not filepath.exists():
            return []
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)

