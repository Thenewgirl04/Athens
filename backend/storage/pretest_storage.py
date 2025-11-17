"""Persistent storage helpers for pretest data."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

from models import Pretest, PretestAttempt


class PretestStorage:
    """Minimal JSON file storage for pretest data."""

    def __init__(self, base_dir: Optional[Path] = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent / "database"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _pretests_file_path(self) -> Path:
        return self.base_dir / "pretests" / "pretests.json"

    def _attempts_file_path(self) -> Path:
        return self.base_dir / "pretest_attempts" / "pretest_attempts.json"

    def save_pretest(self, pretest: Pretest) -> None:
        """Save a pretest to storage."""
        filepath = self._pretests_file_path()
        pretests = self._load_pretests()
        
        # Remove existing pretest for this course if any
        pretests = [p for p in pretests if p.get("courseId") != pretest.courseId]
        
        # Add new pretest
        pretests.append(pretest.model_dump())
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("w", encoding="utf-8") as f:
            json.dump(pretests, f, ensure_ascii=False, indent=2)

    def get_pretest(self, course_id: str) -> Optional[Pretest]:
        """Retrieve pretest for a course."""
        pretests = self._load_pretests()
        for pretest_data in pretests:
            if pretest_data.get("courseId") == course_id:
                return Pretest(**pretest_data)
        return None

    def _load_pretests(self) -> List[Dict[str, Any]]:
        """Load all pretests from storage."""
        filepath = self._pretests_file_path()
        if not filepath.exists():
            return []
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)

    def save_attempt(self, attempt: PretestAttempt) -> None:
        """Save a pretest attempt to storage."""
        filepath = self._attempts_file_path()
        attempts = self._load_attempts()
        
        # Add new attempt
        attempts.append(attempt.model_dump())
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with filepath.open("w", encoding="utf-8") as f:
            json.dump(attempts, f, ensure_ascii=False, indent=2)

    def get_attempt(self, student_id: str, course_id: str) -> Optional[PretestAttempt]:
        """Get student's pretest attempt for a course."""
        attempts = self._load_attempts()
        for attempt_data in attempts:
            if (attempt_data.get("studentId") == student_id and 
                attempt_data.get("courseId") == course_id):
                return PretestAttempt(**attempt_data)
        return None

    def has_completed_pretest(self, student_id: str, course_id: str) -> bool:
        """Check if student has completed pretest for a course."""
        return self.get_attempt(student_id, course_id) is not None

    def _load_attempts(self) -> List[Dict[str, Any]]:
        """Load all pretest attempts from storage."""
        filepath = self._attempts_file_path()
        if not filepath.exists():
            return []
        with filepath.open("r", encoding="utf-8") as f:
            return json.load(f)

