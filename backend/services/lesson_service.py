"""
Service for lesson note generation and management.
"""
import json
import uuid
from datetime import datetime
from typing import List, Optional
from models import (
    Lesson,
    LessonNote,
    LessonSection,
    LessonGenerationRequest,
    LessonGenerationResponse
)
from utils.gemini_client import GeminiClient
from storage.lesson_storage import LessonStorage
from storage.curriculum_storage import CurriculumStorage


class LessonService:
    """Service to handle lesson note generation and management logic."""
    
    def __init__(self):
        """Initialize lesson service with required clients and storage."""
        self.gemini_client = GeminiClient()
        self.lesson_storage = LessonStorage()
        self.curriculum_storage = CurriculumStorage()
    
    def generate_lesson_notes(
        self,
        course_id: str,
        topic_id: str
    ) -> LessonGenerationResponse:
        """
        Generate lesson notes for a topic and create a lesson object.
        
        Args:
            course_id: Course identifier
            topic_id: Topic identifier
        
        Returns:
            LessonGenerationResponse with generated lesson
        """
        try:
            # 1. Fetch curriculum to get topic details
            curriculum = self.curriculum_storage.load(course_id)
            if not curriculum:
                return LessonGenerationResponse(
                    success=False,
                    message=f"Curriculum not found for course {course_id}",
                    lesson=None
                )
            
            # Find the topic
            topic = None
            for week in curriculum.weeks:
                for t in week.topics:
                    if t.id == topic_id:
                        topic = t
                        break
                if topic:
                    break
            
            if not topic:
                return LessonGenerationResponse(
                    success=False,
                    message=f"Topic {topic_id} not found in curriculum",
                    lesson=None
                )
            
            # 2. Call Gemini to generate lesson notes
            gemini_response = self.gemini_client.generate_lesson_notes(
                topic_title=topic.title,
                topic_description=topic.description,
                topic_resources=topic.resources or []
            )
            
            # 3. Parse response into LessonNote object
            lesson_note = self._parse_lesson_notes_response(
                gemini_response,
                topic_id,
                topic.title
            )
            
            # 4. Create Lesson object with generated ID
            lesson_id = str(uuid.uuid4())
            lesson = Lesson(
                id=lesson_id,
                topic_id=topic_id,
                course_id=course_id,
                title=topic.title,
                notes=lesson_note,
                created_at=datetime.utcnow().isoformat(),
                type="generated_notes"
            )
            
            # 5. Store lesson in storage
            self.lesson_storage.save(lesson)
            
            # 6. Return response with lesson object
            return LessonGenerationResponse(
                success=True,
                message="Lesson notes generated successfully",
                lesson=lesson
            )
        
        except json.JSONDecodeError as e:
            return LessonGenerationResponse(
                success=False,
                message=f"Failed to parse Gemini response: {str(e)}",
                lesson=None
            )
        except Exception as e:
            return LessonGenerationResponse(
                success=False,
                message=f"Error generating lesson notes: {str(e)}",
                lesson=None
            )
    
    def get_lessons_for_course(self, course_id: str) -> List[Lesson]:
        """
        Retrieve all lessons for a course.
        
        Args:
            course_id: Course identifier
        
        Returns:
            List of Lesson objects
        """
        return self.lesson_storage.load_all(course_id)
    
    def get_lesson(self, lesson_id: str, course_id: str = None) -> Optional[Lesson]:
        """
        Retrieve a specific lesson.
        
        Args:
            lesson_id: Lesson identifier
            course_id: Optional course identifier
        
        Returns:
            Lesson object if found, None otherwise
        """
        return self.lesson_storage.load_one(lesson_id, course_id)
    
    def _parse_lesson_notes_response(
        self,
        response_text: str,
        topic_id: str,
        topic_title: str
    ) -> LessonNote:
        """
        Parse Gemini's JSON response into LessonNote object.
        
        Args:
            response_text: Raw JSON string from Gemini
            topic_id: Topic identifier
            topic_title: Topic title
        
        Returns:
            LessonNote object
        """
        # Extract JSON from response (in case Gemini includes extra text)
        json_str = self._extract_json(response_text)
        
        # Parse JSON with better error handling
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Try to provide more helpful error message
            error_msg = f"JSON parsing error at position {e.pos}: {e.msg}"
            # Log the problematic section for debugging
            if e.pos and e.pos < len(json_str):
                start = max(0, e.pos - 50)
                end = min(len(json_str), e.pos + 50)
                error_msg += f"\nProblematic section: ...{json_str[start:end]}..."
            raise ValueError(error_msg) from e
        
        # Convert sections
        sections = []
        for section_data in data.get("sections", []):
            section = LessonSection(
                section_type=section_data.get("section_type", ""),
                title=section_data.get("title", ""),
                content=section_data.get("content", "")
            )
            sections.append(section)
        
        # Create LessonNote
        lesson_note = LessonNote(
            topic_id=topic_id,
            topic_title=topic_title,
            sections=sections,
            estimated_duration=data.get("estimated_duration")
        )
        
        return lesson_note
    
    def _extract_json(self, text: str) -> str:
        """
        Extract JSON from text (handles cases where Gemini adds extra text).
        
        Args:
            text: Raw text response from Gemini
        
        Returns:
            Cleaned JSON string
        """
        import re
        
        # Remove markdown code blocks if present (handle various formats)
        text = re.sub(r'```json\s*\n?', '', text, flags=re.IGNORECASE)
        text = re.sub(r'```\s*\n?', '', text)
        text = re.sub(r'^```\s*$', '', text, flags=re.MULTILINE)
        
        # Find first { and last }
        start = text.find('{')
        end = text.rfind('}')
        
        if start == -1 or end == -1:
            raise ValueError("No valid JSON found in Gemini response")
        
        json_str = text[start:end+1]
        
        # Remove invalid control characters that break JSON parsing
        # JSON allows: \n (10), \r (13), \t (9) but not other control chars
        # We need to be careful to preserve escaped sequences like \n, \t, \r
        def clean_json_string(s: str) -> str:
            """Remove invalid control characters while preserving valid JSON structure."""
            result = []
            i = 0
            while i < len(s):
                char = s[i]
                code = ord(char)
                
                # Allow printable ASCII (32-126) and valid whitespace (9, 10, 13)
                if code >= 32 or code in [9, 10, 13]:
                    result.append(char)
                    i += 1
                # Handle escape sequences - if we see a backslash, preserve it and next char
                elif char == '\\' and i + 1 < len(s):
                    result.append(char)  # Add backslash
                    i += 1
                    result.append(s[i])  # Add escaped character
                    i += 1
                # Replace other control chars with space
                elif code < 32:
                    result.append(' ')
                    i += 1
                else:
                    result.append(char)
                    i += 1
            return ''.join(result)
        
        json_str = clean_json_string(json_str)
        
        # Additional cleanup: remove any remaining problematic patterns
        # Fix common issues like unescaped quotes in content (though this is risky)
        # For now, just return the cleaned string
        
        return json_str

