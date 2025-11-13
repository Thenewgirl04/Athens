"""
Service for processing and parsing curriculum generation responses.
"""
import json
from typing import Dict, Any
from models import CurriculumGenerationResponse, Week, Topic
from utils.gemini_client import GeminiClient
from storage.curriculum_storage import CurriculumStorage


class CurriculumService:
    """Service to handle curriculum generation logic."""
    
    def __init__(self):
        """Initialize curriculum service with Gemini client."""
        self.gemini_client = GeminiClient()
        self.storage = CurriculumStorage()
    
    def generate_curriculum(
        self,
        course_id: str,
        syllabus_content: str,
        course_outline: str,
        number_of_weeks: int,
        include_study_materials: bool,
        include_media_links: bool
    ) -> CurriculumGenerationResponse:
        """
        Generate curriculum using Gemini and parse response.
        
        Args:
            syllabus_content: Uploaded file content (optional)
            course_outline: Pasted outline text (optional)
            number_of_weeks: Number of weeks
            include_study_materials: Include study materials
            include_media_links: Include media links
        
        Returns:
            CurriculumGenerationResponse with parsed curriculum
        """
        try:
            # Use syllabus_content if provided, otherwise use course_outline
            content = syllabus_content or course_outline

            if not content:
                raise ValueError("No syllabus content or course outline provided")
            
            # Call Gemini API
            gemini_response = self.gemini_client.generate_curriculum(
                content=content,
                number_of_weeks=number_of_weeks,
                include_study_materials=include_study_materials,
                include_media_links=include_media_links
            )
            
            # Parse JSON response
            parsed_data = self._parse_gemini_response(gemini_response)
            
            # Convert to response model
            response = CurriculumGenerationResponse(
                course_id=course_id,
                success=True,
                message="Curriculum generated successfully",
                weeks=parsed_data
            )

            # Persist curriculum for later retrieval
            self.storage.save(response)
            
            return response
        
        except json.JSONDecodeError as e:
            return CurriculumGenerationResponse(
                course_id=course_id,
                success=False,
                message=f"Failed to parse Gemini response: {str(e)}",
                weeks=[]
            )
        except Exception as e:
            return CurriculumGenerationResponse(
                course_id=course_id,
                success=False,
                message=f"Error generating curriculum: {str(e)}",
                weeks=[]
            )

    def get_curriculum(self, course_id: str) -> CurriculumGenerationResponse | None:
        """Retrieve stored curriculum for a course."""
        return self.storage.load(course_id)
    
    def _parse_gemini_response(self, response_text: str) -> list[Week]:
        """
        Parse Gemini's JSON response into Week objects.
        
        Args:
            response_text: Raw JSON string from Gemini
        
        Returns:
            List of Week objects
        """
        # Extract JSON from response (in case Gemini includes extra text)
        json_str = self._extract_json(response_text)
        
        # Parse JSON
        data = json.loads(json_str)
        
        # Convert to Week objects
        weeks = []
        for week_data in data.get("weeks", []):
            topics = [
                Topic(
                    id=topic.get("id", f"topic_{week_data['week_number']}_0"),
                    title=topic.get("title", ""),
                    description=topic.get("description", ""),
                    resources=topic.get("resources", [])
                )
                for topic in week_data.get("topics", [])
            ]
            
            week = Week(
                week_number=week_data.get("week_number"),
                title=week_data.get("title", ""),
                topics=topics
            )
            weeks.append(week)
        
        return weeks
    
    def _extract_json(self, text: str) -> str:
        """
        Extract JSON from text (handles cases where Gemini adds extra text).
        
        Args:
            text: Raw text response from Gemini
        
        Returns:
            JSON string
        """
        # Find first { and last }
        start = text.find('{')
        end = text.rfind('}')
        
        if start == -1 or end == -1:
            raise ValueError("No valid JSON found in Gemini response")
        
        return text[start:end+1]