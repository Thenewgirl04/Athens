"""Persistent storage helpers for student strength/weakness tracking."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

from models import StudentStrengthWeakness, WeeklyQuizAttempt, QuizAnalysis


class StrengthWeaknessStorage:
    """Storage for student performance tracking (strengths and weaknesses)."""

    def __init__(self, base_dir: Optional[Path] = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent / "database"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _file_path(self) -> Path:
        return self.base_dir / "student_performance" / "student_performance.json"

    def update_student_performance(
        self,
        student_id: str,
        course_id: str,
        quiz_attempt: WeeklyQuizAttempt,
        analysis: QuizAnalysis
    ) -> StudentStrengthWeakness:
        """
        Update student's strengths/weaknesses based on quiz performance.
        Recalculates from all quiz attempts to ensure accuracy.
        
        Args:
            student_id: Student identifier
            course_id: Course identifier
            quiz_attempt: The quiz attempt that was just completed
            analysis: The performance analysis for this attempt
            
        Returns:
            Updated StudentStrengthWeakness object
        """
        # Load all quiz attempts for this student/course to recalculate accurately
        from storage.quiz_storage import QuizStorage
        quiz_storage = QuizStorage()
        
        # Get all attempts for this course (across all weeks)
        all_attempts = quiz_storage._load_attempts()
        student_attempts = [
            WeeklyQuizAttempt(**a) for a in all_attempts
            if a.get("studentId") == student_id and a.get("courseId") == course_id
        ]
        
        # Aggregate topic performance across all attempts
        topic_stats: Dict[str, Dict[str, int]] = {}
        
        for attempt in student_attempts:
            if attempt.analysis and attempt.analysis.topicBreakdown:
                for topic_perf in attempt.analysis.topicBreakdown:
                    topic_id = topic_perf.topicId
                    
                    if topic_id not in topic_stats:
                        topic_stats[topic_id] = {
                            "totalCorrect": 0,
                            "totalAttempted": 0
                        }
                    
                    topic_stats[topic_id]["totalCorrect"] += topic_perf.correctCount
                    topic_stats[topic_id]["totalAttempted"] += topic_perf.questionsCount
        
        # Calculate percentages and classify strengths/weaknesses
        strengths = []
        weaknesses = []
        topic_performance_percentages = {}
        
        for topic_id, stats in topic_stats.items():
            total_correct = stats["totalCorrect"]
            total_attempted = stats["totalAttempted"]
            
            if total_attempted > 0:
                percentage = (total_correct / total_attempted) * 100
                topic_performance_percentages[topic_id] = percentage
                
                if percentage > 75:
                    strengths.append(topic_id)
                elif percentage < 50:
                    weaknesses.append(topic_id)
        
        # Create or update performance object
        performance = StudentStrengthWeakness(
            studentId=student_id,
            courseId=course_id,
            strengths=strengths,
            weaknesses=weaknesses,
            topicPerformance=topic_performance_percentages,
            lastUpdated=datetime.utcnow().isoformat() + "Z"
        )
        
        # Save updated performance
        self._save_performance(performance)
        
        return performance

    def get_student_performance(
        self,
        student_id: str,
        course_id: str
    ) -> StudentStrengthWeakness:
        """
        Retrieve current strengths/weaknesses for a student in a course.
        Creates a new entry if none exists.
        
        Args:
            student_id: Student identifier
            course_id: Course identifier
            
        Returns:
            StudentStrengthWeakness object
        """
        all_performance = self._load_all_performance()
        
        # Find existing performance
        for perf_data in all_performance:
            if (
                perf_data.get("studentId") == student_id and
                perf_data.get("courseId") == course_id
            ):
                return StudentStrengthWeakness(**perf_data)
        
        # Create new performance entry if not found
        new_performance = StudentStrengthWeakness(
            studentId=student_id,
            courseId=course_id,
            strengths=[],
            weaknesses=[],
            topicPerformance={},
            lastUpdated=datetime.utcnow().isoformat() + "Z"
        )
        
        # Save it
        self._save_performance(new_performance)
        
        return new_performance

    def _save_performance(self, performance: StudentStrengthWeakness) -> None:
        """Save or update a performance record."""
        filepath = self._file_path()
        all_performance = self._load_all_performance()
        
        # Remove existing entry for this student/course if any
        all_performance = [
            p for p in all_performance
            if not (
                p.get("studentId") == performance.studentId and
                p.get("courseId") == performance.courseId
            )
        ]
        
        # Add updated entry
        all_performance.append(performance.model_dump())
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("w", encoding="utf-8") as f:
            json.dump(all_performance, f, ensure_ascii=False, indent=2)

    def _load_all_performance(self) -> list[Dict[str, Any]]:
        """Load all performance records from storage."""
        filepath = self._file_path()
        if not filepath.exists():
            return []
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)
