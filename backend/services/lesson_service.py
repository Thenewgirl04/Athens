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
    LessonGenerationResponse,
    LessonCreateRequest,
    LessonCreateResponse,
    LessonUpdateRequest,
    TopicWithLessons,
    LessonsByTopicResponse
)
from utils.gemini_client import GeminiClient
from storage.lesson_storage import LessonStorage
from storage.curriculum_storage import CurriculumStorage
from storage.file_storage import FileStorage
from fastapi import UploadFile


class LessonService:
    """Service to handle lesson note generation and management logic."""
    
    def __init__(self):
        """Initialize lesson service with required clients and storage."""
        self.gemini_client = GeminiClient()
        self.lesson_storage = LessonStorage()
        self.curriculum_storage = CurriculumStorage()
        self.file_storage = FileStorage()
    
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
                type="ai_generated"
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
    
    def create_manual_lesson(self, request: LessonCreateRequest) -> LessonCreateResponse:
        """
        Create a manual lesson (rich text or link).
        
        Args:
            request: LessonCreateRequest with lesson data
        
        Returns:
            LessonCreateResponse with created lesson
        """
        try:
            lesson_id = str(uuid.uuid4())
            
            # Create lesson notes if sections provided
            lesson_note = None
            if request.sections:
                lesson_note = LessonNote(
                    topic_id=request.topic_id or "miscellaneous",
                    topic_title=request.title,
                    sections=request.sections,
                    estimated_duration=request.estimated_duration
                )
            
            # Create lesson object
            lesson = Lesson(
                id=lesson_id,
                topic_id=request.topic_id or "miscellaneous",
                course_id=request.course_id,
                title=request.title,
                notes=lesson_note,
                created_at=datetime.utcnow().isoformat(),
                type=request.content_type,
                external_url=request.external_url
            )
            
            # Save lesson
            self.lesson_storage.save(lesson)
            
            return LessonCreateResponse(
                success=True,
                message="Lesson created successfully",
                lesson=lesson
            )
        
        except Exception as e:
            return LessonCreateResponse(
                success=False,
                message=f"Error creating lesson: {str(e)}",
                lesson=None
            )
    
    def create_file_lesson(
        self,
        course_id: str,
        title: str,
        topic_id: Optional[str],
        file: UploadFile,
        content_type: str
    ) -> LessonCreateResponse:
        """
        Create a file-based lesson (PDF, video, document).
        
        Args:
            course_id: Course identifier
            title: Lesson title
            topic_id: Optional topic ID
            file: Uploaded file
            content_type: Content type (file_pdf, file_video, file_document)
        
        Returns:
            LessonCreateResponse with created lesson
        """
        try:
            lesson_id = str(uuid.uuid4())
            
            # Save file
            file_path = self.file_storage.save_file(course_id, lesson_id, file)
            
            # Get file size
            file_size_bytes = self.file_storage.get_file_size(file_path)
            file_size_str = self.file_storage.format_file_size(file_size_bytes) if file_size_bytes else None
            
            # Create lesson object
            lesson = Lesson(
                id=lesson_id,
                topic_id=topic_id or "miscellaneous",
                course_id=course_id,
                title=title,
                notes=None,
                created_at=datetime.utcnow().isoformat(),
                type=content_type,
                file_url=file_path,
                file_size=file_size_str
            )
            
            # Save lesson
            self.lesson_storage.save(lesson)
            
            return LessonCreateResponse(
                success=True,
                message="File lesson created successfully",
                lesson=lesson
            )
        
        except Exception as e:
            return LessonCreateResponse(
                success=False,
                message=f"Error creating file lesson: {str(e)}",
                lesson=None
            )
    
    def update_lesson(
        self,
        lesson_id: str,
        request: LessonUpdateRequest,
        course_id: Optional[str] = None
    ) -> LessonCreateResponse:
        """
        Update an existing lesson.
        
        Args:
            lesson_id: Lesson identifier
            request: LessonUpdateRequest with update data
            course_id: Optional course identifier to narrow search
        
        Returns:
            LessonCreateResponse with updated lesson
        """
        try:
            # Load existing lesson
            lesson = self.lesson_storage.load_one(lesson_id, course_id)
            if not lesson:
                return LessonCreateResponse(
                    success=False,
                    message="Lesson not found",
                    lesson=None
                )
            
            # Update fields
            if request.title is not None:
                lesson.title = request.title
            if request.topic_id is not None:
                lesson.topic_id = request.topic_id
            if request.external_url is not None:
                lesson.external_url = request.external_url
            
            # Update notes if sections provided
            if request.sections is not None:
                if lesson.notes:
                    lesson.notes.sections = request.sections
                    if request.estimated_duration:
                        lesson.notes.estimated_duration = request.estimated_duration
                else:
                    # Create new notes
                    lesson.notes = LessonNote(
                        topic_id=lesson.topic_id,
                        topic_title=lesson.title,
                        sections=request.sections,
                        estimated_duration=request.estimated_duration
                    )
            
            # Save updated lesson
            self.lesson_storage.save(lesson)
            
            return LessonCreateResponse(
                success=True,
                message="Lesson updated successfully",
                lesson=lesson
            )
        
        except Exception as e:
            return LessonCreateResponse(
                success=False,
                message=f"Error updating lesson: {str(e)}",
                lesson=None
            )
    
    def delete_lesson(self, lesson_id: str, course_id: Optional[str] = None) -> bool:
        """
        Delete a lesson.
        
        Args:
            lesson_id: Lesson identifier
            course_id: Optional course identifier
        
        Returns:
            True if deleted, False if not found
        """
        try:
            # Load lesson to get course_id if not provided
            if not course_id:
                lesson = self.lesson_storage.load_one(lesson_id)
                if not lesson:
                    return False
                course_id = lesson.course_id
            
            # Delete file if it's a file-based lesson
            lesson = self.lesson_storage.load_one(lesson_id, course_id)
            if lesson and lesson.file_url:
                self.file_storage.delete_lesson_directory(course_id, lesson_id)
            
            # Delete lesson from storage
            return self.lesson_storage.delete(lesson_id, course_id)
        
        except Exception as e:
            print(f"Error deleting lesson: {str(e)}")
            return False
    
    def get_lessons_by_topic(self, course_id: str) -> LessonsByTopicResponse:
        """
        Get all lessons for a course grouped by topics.
        
        Args:
            course_id: Course identifier
        
        Returns:
            LessonsByTopicResponse with lessons grouped by topics
        """
        # Get all lessons for course
        lessons = self.get_lessons_for_course(course_id)
        
        # Get curriculum to get topic information
        curriculum = self.curriculum_storage.load(course_id)
        
        # Build topic map
        topic_map: dict[str, TopicWithLessons] = {}
        
        # Add topics from curriculum
        if curriculum:
            for week in curriculum.weeks:
                for topic in week.topics:
                    topic_map[topic.id] = TopicWithLessons(
                        topic_id=topic.id,
                        topic_title=topic.title,
                        topic_description=topic.description,
                        week_number=week.week_number,
                        week_title=week.title,
                        lessons=[]
                    )
        
        # Add miscellaneous topic
        topic_map["miscellaneous"] = TopicWithLessons(
            topic_id="miscellaneous",
            topic_title="Miscellaneous",
            topic_description="Lessons not assigned to a specific topic",
            week_number=None,
            week_title=None,
            lessons=[]
        )
        
        # Group lessons by topic
        for lesson in lessons:
            topic_id = lesson.topic_id or "miscellaneous"
            if topic_id not in topic_map:
                # Topic doesn't exist in curriculum, create placeholder
                topic_map[topic_id] = TopicWithLessons(
                    topic_id=topic_id,
                    topic_title=topic_id.replace("_", " ").title(),
                    topic_description=None,
                    week_number=None,
                    week_title=None,
                    lessons=[]
                )
            topic_map[topic_id].lessons.append(lesson)
        
        # Convert to list and sort by week number
        topics_list = list(topic_map.values())
        topics_list.sort(key=lambda t: (
            t.week_number if t.week_number is not None else 999,
            t.topic_title
        ))
        
        return LessonsByTopicResponse(
            course_id=course_id,
            topics=topics_list
        )
    
    def get_topics_for_course(self, course_id: str) -> List[dict]:
        """
        Get all topics for a course (from curriculum) plus Miscellaneous.
        
        Args:
            course_id: Course identifier
        
        Returns:
            List of topic dictionaries with id, title, description, week_number, week_title
        """
        topics = []
        
        # Get curriculum
        curriculum = self.curriculum_storage.load(course_id)
        
        if curriculum:
            for week in curriculum.weeks:
                for topic in week.topics:
                    topics.append({
                        "id": topic.id,
                        "title": topic.title,
                        "description": topic.description,
                        "week_number": week.week_number,
                        "week_title": week.title
                    })
        
        # Add Miscellaneous option
        topics.append({
            "id": "miscellaneous",
            "title": "Miscellaneous",
            "description": "Lessons not assigned to a specific topic",
            "week_number": None,
            "week_title": None
        })
        
        return topics

