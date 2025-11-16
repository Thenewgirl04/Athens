"""
FastAPI application for Teacher Dashboard Backend.
"""
from typing import List
from fastapi import FastAPI, HTTPException, Request
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from models import (
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    HealthCheckResponse,
    LessonGenerationRequest,
    LessonGenerationResponse,
    Lesson
)
from services.curriculum_service import CurriculumService
from services.lesson_service import LessonService
from config import settings

import uvicorn

app = FastAPI(title="Teacher Dashboard Backend", version="1.0.0")

# Initialize services
curriculum_service = CurriculumService()
lesson_service = LessonService()


def _coerce_bool(value: bool | str | None, default: bool) -> bool:
    """Coerce form values to boolean."""
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return value.lower() in {"true", "1", "yes", "on"}


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint with API info."""
    return {
        "name": "Teacher Dashboard Backend",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
def health_check():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="healthy",
        message="Backend server is running"
    )


@app.post("/api/curriculum/generate", response_model=CurriculumGenerationResponse, tags=["Curriculum"])
async def generate_curriculum(request: Request) -> CurriculumGenerationResponse:
    """
    Generate a comprehensive curriculum from a rough outline or syllabus.
    
    Args:
        request: CurriculumGenerationRequest containing syllabus/outline and options
    
    Returns:
        CurriculumGenerationResponse with generated curriculum
    """
    try:
        payload: CurriculumGenerationRequest | None = None
        content_type = request.headers.get("content-type", "")

        if content_type.startswith("multipart/form-data"):
            form = await request.form()

            course_id = form.get("course_id")
            number_of_weeks = form.get("number_of_weeks")

            if course_id is None or number_of_weeks is None:
                raise HTTPException(
                    status_code=400,
                    detail="course_id and number_of_weeks are required"
                )

            syllabus_content = None
            upload: UploadFile | None = form.get("syllabus_file")  # type: ignore[assignment]
            if isinstance(upload, UploadFile):
                file_bytes = await upload.read()
                syllabus_content = file_bytes.decode("utf-8", errors="ignore")

            payload = CurriculumGenerationRequest(
                course_id=course_id,
                syllabus_content=syllabus_content,
                course_outline=form.get("course_outline"),
                number_of_weeks=int(number_of_weeks),
                include_study_materials=_coerce_bool(form.get("include_study_materials"), default=True),
                include_media_links=_coerce_bool(form.get("include_media_links"), default=True),
                ai_engine=form.get("ai_engine") or "gemini"
            )
        else:
            data = await request.json()
            payload = CurriculumGenerationRequest(**data)

        # Validate that at least one content source is provided
        if not payload.syllabus_content and not payload.course_outline:
            raise HTTPException(
                status_code=400,
                detail="At least one of syllabus_content or course_outline is required"
            )
        
        # Generate curriculum using service
        response = curriculum_service.generate_curriculum(
            course_id=payload.course_id,
            syllabus_content=payload.syllabus_content or "",
            course_outline=payload.course_outline or "",
            number_of_weeks=payload.number_of_weeks,
            include_study_materials=payload.include_study_materials,
            include_media_links=payload.include_media_links
        )
        
        # If generation failed, return error response
        if not response.success:
            raise HTTPException(
                status_code=500,
                detail=response.message
            )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.get("/api/curriculum/{course_id}", response_model=CurriculumGenerationResponse, tags=["Curriculum"])
def get_curriculum(course_id: str) -> CurriculumGenerationResponse:
    """Retrieve the most recently generated curriculum for a course."""
    stored = curriculum_service.get_curriculum(course_id)
    if stored is None or not stored.weeks:
        raise HTTPException(status_code=404, detail="Curriculum not found")
    return stored


# Lesson Note Generation Endpoints

@app.post("/api/lessons/generate", response_model=LessonGenerationResponse, tags=["Lessons"])
def generate_lesson_notes(request: LessonGenerationRequest) -> LessonGenerationResponse:
    """
    Generate detailed lesson notes for a specific topic.
    
    Args:
        request: LessonGenerationRequest with course_id, topic_id, topic_title, and topic_description
    
    Returns:
        LessonGenerationResponse with generated lesson notes
    """
    try:
        response = lesson_service.generate_lesson_notes(
            course_id=request.course_id,
            topic_id=request.topic_id
        )
        
        if not response.success:
            raise HTTPException(
                status_code=500,
                detail=response.message
            )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@app.get("/api/lessons/{course_id}", response_model=List[Lesson], tags=["Lessons"])
def get_course_lessons(course_id: str) -> List[Lesson]:
    """
    Retrieve all lessons for a specific course.
    
    Args:
        course_id: Course identifier
    
    Returns:
        List of Lesson objects
    """
    try:
        lessons = lesson_service.get_lessons_for_course(course_id)
        return lessons
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving lessons: {str(e)}"
        )


@app.get("/api/lesson/{lesson_id}", response_model=Lesson, tags=["Lessons"])
def get_lesson(lesson_id: str, course_id: str = None) -> Lesson:
    """
    Retrieve a specific lesson by ID.
    
    Args:
        lesson_id: Lesson identifier
        course_id: Optional course identifier to narrow search
    
    Returns:
        Lesson object
    """
    try:
        lesson = lesson_service.get_lesson(lesson_id, course_id)
        if not lesson:
            raise HTTPException(
                status_code=404,
                detail="Lesson not found"
            )
        return lesson
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving lesson: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
