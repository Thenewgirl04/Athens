"""
Storage handler for lesson data.
"""
import json
from pathlib import Path
from typing import List, Optional
from models import Lesson


class LessonStorage:
    """Handles persistence of lesson data to JSON files."""
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize lesson storage.
        
        Args:
            data_dir: Directory to store lesson files
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
    
    def _get_file_path(self, course_id: str) -> Path:
        """
        Get the file path for a course's lessons.
        
        Args:
            course_id: Course identifier
        
        Returns:
            Path to the lessons file
        """
        return self.data_dir / f"lessons_{course_id}.json"
    
    def save(self, lesson: Lesson) -> None:
        """
        Save a lesson to storage.
        
        Args:
            lesson: Lesson object to save
        """
        file_path = self._get_file_path(lesson.course_id)
        
        # Load existing lessons for this course
        existing_lessons = []
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    existing_lessons = data.get("lessons", [])
            except (json.JSONDecodeError, KeyError):
                existing_lessons = []
        
        # Check if lesson already exists and update, otherwise append
        lesson_dict = lesson.model_dump()
        lesson_exists = False
        
        for i, existing_lesson in enumerate(existing_lessons):
            if existing_lesson.get("id") == lesson.id:
                existing_lessons[i] = lesson_dict
                lesson_exists = True
                break
        
        if not lesson_exists:
            existing_lessons.append(lesson_dict)
        
        # Save updated lessons
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump({"lessons": existing_lessons}, f, indent=2, ensure_ascii=False)
    
    def load_all(self, course_id: str) -> List[Lesson]:
        """
        Load all lessons for a course.
        
        Args:
            course_id: Course identifier
        
        Returns:
            List of Lesson objects
        """
        file_path = self._get_file_path(course_id)
        
        if not file_path.exists():
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                lessons_data = data.get("lessons", [])
                return [Lesson(**lesson_data) for lesson_data in lessons_data]
        except (json.JSONDecodeError, KeyError, ValueError):
            return []
    
    def load_one(self, lesson_id: str, course_id: str = None) -> Optional[Lesson]:
        """
        Load a specific lesson by ID.
        
        Args:
            lesson_id: Lesson identifier
            course_id: Optional course identifier to narrow search
        
        Returns:
            Lesson object if found, None otherwise
        """
        if course_id:
            # Search in specific course file
            lessons = self.load_all(course_id)
            for lesson in lessons:
                if lesson.id == lesson_id:
                    return lesson
            return None
        else:
            # Search all lesson files
            for file_path in self.data_dir.glob("lessons_*.json"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        lessons_data = data.get("lessons", [])
                        for lesson_data in lessons_data:
                            if lesson_data.get("id") == lesson_id:
                                return Lesson(**lesson_data)
                except (json.JSONDecodeError, KeyError, ValueError):
                    continue
            return None
    
    def delete(self, lesson_id: str, course_id: str) -> bool:
        """
        Delete a lesson from storage.
        
        Args:
            lesson_id: Lesson identifier
            course_id: Course identifier
        
        Returns:
            True if deleted, False if not found
        """
        file_path = self._get_file_path(course_id)
        
        if not file_path.exists():
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                lessons = data.get("lessons", [])
            
            # Filter out the lesson to delete
            original_count = len(lessons)
            lessons = [l for l in lessons if l.get("id") != lesson_id]
            
            if len(lessons) == original_count:
                return False  # Lesson not found
            
            # Save updated lessons
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump({"lessons": lessons}, f, indent=2, ensure_ascii=False)
            
            return True
        except (json.JSONDecodeError, KeyError):
            return False

