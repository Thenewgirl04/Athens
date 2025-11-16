"""
Pydantic models for request and response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class CurriculumGenerationRequest(BaseModel):
    """Request schema for curriculum generation."""
    
    course_id: str = Field(..., description="Unique identifier for the course")
    syllabus_content: Optional[str] = Field(None, description="Content from uploaded syllabus file (processed in-memory, discarded after)")
    course_outline: Optional[str] = Field(None, description="Rough outline text pasted by user")
    number_of_weeks: int = Field(..., description="Number of weeks for the course", gt=0, le=52)
    include_study_materials: bool = Field(True, description="Include study materials in generation")
    include_media_links: bool = Field(True, description="Include media links (YouTube, documentation, etc.)")
    ai_engine: str = Field("gemini", description="AI engine to use (gemini)")


class Resource(BaseModel):
    """Represents a learning resource with type classification."""
    
    url: str
    type: str = Field(..., description="Resource type: 'article', 'video', 'pdf', or 'course'")


class Topic(BaseModel):
    """Represents a topic/lesson within a week."""
    
    id: str
    title: str
    description: str
    resources: Optional[List[Resource]] = Field(default=None, description="Learning resources with type classification")


class Week(BaseModel):
    """Represents a week in the curriculum."""
    
    week_number: int
    title: str
    topics: List[Topic] = Field(default_factory=list)


class CurriculumGenerationResponse(BaseModel):
    """Response schema for curriculum generation."""
    
    course_id: Optional[str] = Field(default=None, description="Course identifier the curriculum belongs to")
    success: bool
    message: str
    weeks: List[Week] = Field(default_factory=list)


class HealthCheckResponse(BaseModel):
    """Health check response."""
    
    status: str
    message: str


# Lesson Note Generation Models

class LessonSection(BaseModel):
    """A section within lesson notes."""
    
    section_type: str = Field(..., description="Section type: 'introduction', 'explanation', 'example', 'activity', 'summary'")
    title: str
    content: str


class LessonNote(BaseModel):
    """Detailed lesson notes for a topic."""
    
    topic_id: str
    topic_title: str
    sections: List[LessonSection]
    estimated_duration: Optional[str] = Field(None, description="e.g., '45 minutes'")


class Lesson(BaseModel):
    """Represents a lesson/module with its notes."""
    
    id: str
    topic_id: str
    course_id: str
    title: str
    notes: LessonNote
    created_at: str
    type: str = Field(default="generated_notes", description="To distinguish from uploaded materials")


class LessonGenerationRequest(BaseModel):
    """Request to generate lesson notes for a topic."""
    
    course_id: str = Field(..., description="Course identifier")
    topic_id: str = Field(..., description="Topic identifier")
    topic_title: str = Field(..., description="Topic title")
    topic_description: str = Field(..., description="Topic description")


class LessonGenerationResponse(BaseModel):
    """Response from lesson note generation."""
    
    success: bool
    message: str
    lesson: Optional[Lesson] = None
