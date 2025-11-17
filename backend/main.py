"""
FastAPI application for Teacher Dashboard Backend.
"""
from typing import List
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.datastructures import UploadFile
from fastapi.middleware.cors import CORSMiddleware
from models import (
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    HealthCheckResponse,
    LessonGenerationRequest,
    LessonGenerationResponse,
    Lesson,
    LoginRequest,
    AuthResponse,
    StudentProfileResponse,
    StudentCourseResponse,
    StudentAssignmentResponse,
    StudentQuizResponse,
    Pretest,
    PretestSubmissionRequest,
    PretestResultResponse
)
from services.curriculum_service import CurriculumService
from services.lesson_service import LessonService
from services.auth_service import AuthService
from services.student_service import StudentService
from services.pretest_service import PretestService
from config import settings

import uvicorn

app = FastAPI(title="Teacher Dashboard Backend", version="1.0.0")

# Initialize services
curriculum_service = CurriculumService()
lesson_service = LessonService()
auth_service = AuthService()
student_service = StudentService()
pretest_service = PretestService()


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


# Authentication Endpoints

@app.post("/api/auth/login", response_model=AuthResponse, tags=["Authentication"])
def login(request: LoginRequest) -> AuthResponse:
    """
    Authenticate a student or teacher.
    
    Args:
        request: LoginRequest with email and password
    
    Returns:
        AuthResponse with user data and token
    """
    try:
        # Try student first
        user = auth_service.authenticate_student(request.email, request.password)
        role = "student"
        
        # If not a student, try teacher
        if not user:
            user = auth_service.authenticate_teacher(request.email, request.password)
            role = "teacher"
        
        if not user:
            return AuthResponse(
                success=False,
                message="Invalid email or password",
                user=None,
                token=None
            )
        
        # Create simple token (in production, use JWT)
        token = f"token_{user.get('id', '')}_{role}"
        
        # Prepare user response (without password)
        user_response = {
            "id": user.get("id"),
            "email": user.get("email"),
            "firstName": user.get("firstName"),
            "lastName": user.get("lastName"),
            "role": role
        }
        
        # Add role-specific fields
        if role == "student":
            user_response["studentId"] = user.get("studentId")
            user_response["avatarUrl"] = user.get("avatarUrl")
        elif role == "teacher":
            user_response["department"] = user.get("department")
        
        return AuthResponse(
            success=True,
            message="Login successful",
            user=user_response,
            token=token
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during authentication: {str(e)}"
        )


# Student Endpoints

@app.get("/api/student/profile", tags=["Student"])
def get_student_profile(student_id: str) -> dict:
    """
    Get student profile by ID.
    
    Args:
        student_id: Student ID (query parameter)
    
    Returns:
        Student profile data
    """
    try:
        if not student_id:
            raise HTTPException(
                status_code=400,
                detail="student_id is required"
            )
        student = student_service.get_student_by_id(student_id)
        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )
        return {"student": student}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving student profile: {str(e)}"
        )


@app.get("/api/student/{student_id}/courses", tags=["Student"])
def get_student_courses(student_id: str) -> List[dict]:
    """
    Get all courses for a student with progress.
    
    Args:
        student_id: Student ID
    
    Returns:
        List of courses with progress
    """
    try:
        courses = student_service.get_student_courses(student_id)
        return courses
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving student courses: {str(e)}"
        )


@app.get("/api/student/{student_id}/assignments", tags=["Student"])
def get_student_assignments(student_id: str) -> List[dict]:
    """
    Get all assignments for a student with submission status.
    
    Args:
        student_id: Student ID
    
    Returns:
        List of assignments with submission status
    """
    try:
        assignments = student_service.get_student_assignments(student_id)
        return assignments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving student assignments: {str(e)}"
        )


@app.get("/api/student/{student_id}/quizzes", tags=["Student"])
def get_student_quizzes(student_id: str) -> List[dict]:
    """
    Get all quizzes for a student with attempt history.
    
    Args:
        student_id: Student ID
    
    Returns:
        List of quizzes with attempt history
    """
    try:
        quizzes = student_service.get_student_quiz_history(student_id)
        return quizzes
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving student quizzes: {str(e)}"
        )


@app.put("/api/student/{student_id}/profile", tags=["Student"])
def update_student_profile(student_id: str, updates: dict) -> dict:
    """
    Update student profile information.
    
    Args:
        student_id: Student ID
        updates: Dict of fields to update
    
    Returns:
        Updated student profile
    """
    try:
        updated_student = student_service.update_student_profile(student_id, updates)
        if not updated_student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )
        return {"student": updated_student}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating student profile: {str(e)}"
        )


# Pretest Endpoints

@app.post("/api/pretest/generate", response_model=Pretest, tags=["Pretest"])
def generate_pretest(course_id: str = Query(..., description="Course identifier")) -> Pretest:
    """
    Generate pretest for a course (usually auto-called after curriculum generation).
    
    Args:
        course_id: Course identifier (query parameter)
    
    Returns:
        Generated Pretest object
    """
    try:
        pretest = pretest_service.generate_pretest_for_curriculum(course_id)
        return pretest
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating pretest: {str(e)}"
        )


@app.get("/api/pretest/{course_id}", response_model=Pretest, tags=["Pretest"])
def get_pretest(course_id: str) -> Pretest:
    """
    Get pretest questions for a course.
    
    Args:
        course_id: Course identifier
    
    Returns:
        Pretest object with questions
    """
    try:
        pretest = pretest_service.get_pretest(course_id)
        if not pretest:
            raise HTTPException(
                status_code=404,
                detail="Pretest not found for this course"
            )
        return pretest
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving pretest: {str(e)}"
        )


@app.post("/api/pretest/submit", response_model=PretestResultResponse, tags=["Pretest"])
def submit_pretest(request: PretestSubmissionRequest) -> PretestResultResponse:
    """
    Submit pretest answers and get results with analysis.
    
    Args:
        request: PretestSubmissionRequest with student answers
    
    Returns:
        PretestResultResponse with analysis and recommendations
    """
    try:
        result = pretest_service.submit_pretest(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting pretest: {str(e)}"
        )


@app.get("/api/pretest/{course_id}/status/{student_id}", tags=["Pretest"])
def get_pretest_status(course_id: str, student_id: str) -> dict:
    """
    Check if student has completed pretest for a course.
    
    Args:
        course_id: Course identifier
        student_id: Student identifier
    
    Returns:
        Dict with completion status
    """
    try:
        completed = pretest_service.has_completed_pretest(student_id, course_id)
        return {
            "courseId": course_id,
            "studentId": student_id,
            "completed": completed
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking pretest status: {str(e)}"
        )


@app.get("/api/pretest/{course_id}/results/{student_id}", response_model=PretestResultResponse, tags=["Pretest"])
def get_pretest_results(course_id: str, student_id: str) -> PretestResultResponse:
    """
    Get pretest results and analysis for a student.
    
    Args:
        course_id: Course identifier
        student_id: Student identifier
    
    Returns:
        PretestResultResponse with analysis and recommendations
    """
    try:
        result = pretest_service.get_pretest_result(student_id, course_id)
        if not result:
            raise HTTPException(
                status_code=404,
                detail="Pretest results not found. Student may not have completed the pretest."
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving pretest results: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
