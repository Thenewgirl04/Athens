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


class Topic(BaseModel):
    """Represents a topic/lesson within a week."""
    
    id: str
    title: str
    description: str
    resources: Optional[List[str]] = Field(default=None, description="URLs to study materials or media links")


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
