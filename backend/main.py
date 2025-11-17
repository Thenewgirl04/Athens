"""
FastAPI application for Teacher Dashboard Backend.
"""
from typing import List
from fastapi import FastAPI, HTTPException, Request, Query, File, Form
from fastapi.datastructures import UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from models import (
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    HealthCheckResponse,
    LessonGenerationRequest,
    LessonGenerationResponse,
    Lesson,
    LessonCreateRequest,
    LessonCreateResponse,
    LessonUpdateRequest,
    LessonsByTopicResponse,
    LoginRequest,
    AuthResponse,
    StudentProfileResponse,
    StudentCourseResponse,
    StudentAssignmentResponse,
    StudentQuizResponse,
    Pretest,
    PretestSubmissionRequest,
    PretestResultResponse,
    WeeklyQuiz,
    QuizSubmissionRequest,
    QuizSubmissionResponse,
    QuizAvailabilityResponse
)
from services.curriculum_service import CurriculumService
from services.lesson_service import LessonService
from services.auth_service import AuthService
from services.student_service import StudentService
from services.pretest_service import PretestService
from services.quiz_service import QuizService
from config import settings

import uvicorn

app = FastAPI(title="Teacher Dashboard Backend", version="1.0.0")

# Initialize services
curriculum_service = CurriculumService()
lesson_service = LessonService()
auth_service = AuthService()
student_service = StudentService()
pretest_service = PretestService()
quiz_service = QuizService()


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


@app.post("/api/lessons/manual/create", response_model=LessonCreateResponse, tags=["Lessons"])
def create_manual_lesson(request: LessonCreateRequest) -> LessonCreateResponse:
    """
    Create a manual lesson (rich text or link).
    
    Args:
        request: LessonCreateRequest with lesson data
    
    Returns:
        LessonCreateResponse with created lesson
    """
    try:
        response = lesson_service.create_manual_lesson(request)
        if not response.success:
            raise HTTPException(
                status_code=400,
                detail=response.message
            )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating lesson: {str(e)}"
        )


@app.post("/api/lessons/file/create", response_model=LessonCreateResponse, tags=["Lessons"])
async def create_file_lesson(
    course_id: str = Form(...),
    title: str = Form(...),
    topic_id: str = Form(None),
    content_type: str = Form(...),
    file: UploadFile = File(...)
) -> LessonCreateResponse:
    """
    Create a file-based lesson (PDF, video, document).
    
    Args:
        course_id: Course identifier
        title: Lesson title
        topic_id: Optional topic ID
        content_type: Content type (file_pdf, file_video, file_document)
        file: Uploaded file
    
    Returns:
        LessonCreateResponse with created lesson
    """
    try:
        response = lesson_service.create_file_lesson(
            course_id=course_id,
            title=title,
            topic_id=topic_id if topic_id and topic_id != "null" else None,
            file=file,
            content_type=content_type
        )
        if not response.success:
            raise HTTPException(
                status_code=400,
                detail=response.message
            )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating file lesson: {str(e)}"
        )


@app.put("/api/lessons/{lesson_id}", response_model=LessonCreateResponse, tags=["Lessons"])
def update_lesson(lesson_id: str, request: LessonUpdateRequest, course_id: str = None) -> LessonCreateResponse:
    """
    Update an existing lesson.
    
    Args:
        lesson_id: Lesson identifier
        request: LessonUpdateRequest with update data
        course_id: Optional course identifier
    
    Returns:
        LessonCreateResponse with updated lesson
    """
    try:
        response = lesson_service.update_lesson(lesson_id, request, course_id)
        if not response.success:
            raise HTTPException(
                status_code=404 if "not found" in response.message.lower() else 400,
                detail=response.message
            )
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating lesson: {str(e)}"
        )


@app.delete("/api/lessons/{lesson_id}", tags=["Lessons"])
def delete_lesson(lesson_id: str, course_id: str = None) -> dict:
    """
    Delete a lesson.
    
    Args:
        lesson_id: Lesson identifier
        course_id: Optional course identifier
    
    Returns:
        Success message
    """
    try:
        success = lesson_service.delete_lesson(lesson_id, course_id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Lesson not found"
            )
        return {"success": True, "message": "Lesson deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting lesson: {str(e)}"
        )


@app.post("/api/lessons/generate-from-topic", response_model=LessonGenerationResponse, tags=["Lessons"])
def generate_lesson_from_topic(request: LessonGenerationRequest) -> LessonGenerationResponse:
    """
    Generate AI lesson notes from a curriculum topic.
    
    Args:
        request: LessonGenerationRequest with course_id and topic_id
    
    Returns:
        LessonGenerationResponse with generated lesson
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
            detail=f"Error generating lesson: {str(e)}"
        )


@app.get("/api/lessons/by-topic/{course_id}", response_model=LessonsByTopicResponse, tags=["Lessons"])
def get_lessons_by_topic(course_id: str) -> LessonsByTopicResponse:
    """
    Get all lessons for a course grouped by topics.
    
    Args:
        course_id: Course identifier
    
    Returns:
        LessonsByTopicResponse with lessons grouped by topics
    """
    try:
        return lesson_service.get_lessons_by_topic(course_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving lessons: {str(e)}"
        )


@app.get("/api/topics/{course_id}", tags=["Lessons"])
def get_topics(course_id: str) -> List[dict]:
    """
    Get all topics for a course (from curriculum) plus Miscellaneous.
    
    Args:
        course_id: Course identifier
    
    Returns:
        List of topic dictionaries
    """
    try:
        return lesson_service.get_topics_for_course(course_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving topics: {str(e)}"
        )


@app.get("/api/lessons/file/{course_id}/{lesson_id}/{filename:path}", tags=["Lessons"])
def get_lesson_file(course_id: str, lesson_id: str, filename: str):
    """
    Serve lesson file.
    
    Args:
        course_id: Course identifier
        lesson_id: Lesson identifier
        filename: Filename (path relative to lesson directory)
    
    Returns:
        File response
    """
    try:
        # Extract just the filename from the path
        import os
        actual_filename = os.path.basename(filename)
        file_path = lesson_service.file_storage.get_file_path(f"{course_id}/{lesson_id}/{actual_filename}")
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        return FileResponse(
            path=str(file_path),
            filename=actual_filename,
            media_type='application/octet-stream'
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving file: {str(e)}"
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


# Weekly Quiz Endpoints

@app.post("/api/quiz/generate-main/{course_id}/{week_number}", response_model=WeeklyQuiz, tags=["Quiz"])
def generate_main_quiz(course_id: str, week_number: int) -> WeeklyQuiz:
    """
    Generate main quiz for a specific week.
    
    Args:
        course_id: Course identifier
        week_number: Week number
    
    Returns:
        Generated WeeklyQuiz object
    """
    try:
        quiz = quiz_service.generate_main_quiz_for_week(course_id, week_number)
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating main quiz: {str(e)}"
        )


@app.get("/api/quiz/get/{course_id}/{week_number}/{quiz_type}", response_model=WeeklyQuiz, tags=["Quiz"])
def get_quiz(course_id: str, week_number: int, quiz_type: str) -> WeeklyQuiz:
    """
    Get a quiz by course, week, and type.
    
    Args:
        course_id: Course identifier
        week_number: Week number
        quiz_type: Quiz type ('main', 'refresher', or 'dynamic')
    
    Returns:
        WeeklyQuiz object
    """
    try:
        quiz = quiz_service.storage.get_quiz(course_id, week_number, quiz_type)
        if not quiz:
            raise HTTPException(
                status_code=404,
                detail=f"No {quiz_type} quiz found for course {course_id}, week {week_number}"
            )
        return quiz
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving quiz: {str(e)}"
        )


@app.post("/api/quiz/generate-refresher/{course_id}/{week_number}", response_model=WeeklyQuiz, tags=["Quiz"])
def generate_refresher_quiz(course_id: str, week_number: int) -> WeeklyQuiz:
    """
    Generate a new refresher quiz for a week.
    
    Args:
        course_id: Course identifier
        week_number: Week number
    
    Returns:
        Generated WeeklyQuiz object
    """
    try:
        quiz = quiz_service.generate_refresher_quiz(course_id, week_number)
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating refresher quiz: {str(e)}"
        )


@app.post("/api/quiz/generate-dynamic/{course_id}/{week_number}/{student_id}", response_model=WeeklyQuiz, tags=["Quiz"])
def generate_dynamic_quiz(course_id: str, week_number: int, student_id: str) -> WeeklyQuiz:
    """
    Generate dynamic quiz targeting student's weak areas.
    
    Args:
        course_id: Course identifier
        week_number: Week number
        student_id: Student identifier
    
    Returns:
        Generated WeeklyQuiz object
    """
    try:
        quiz = quiz_service.generate_dynamic_quiz(course_id, week_number, student_id)
        return quiz
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error generating dynamic quiz: {error_trace}")  # Log full traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error generating dynamic quiz: {str(e)}"
        )


@app.post("/api/quiz/submit", response_model=QuizSubmissionResponse, tags=["Quiz"])
def submit_quiz(request: QuizSubmissionRequest) -> QuizSubmissionResponse:
    """
    Submit quiz answers and get results with analysis.
    
    Args:
        request: QuizSubmissionRequest with student answers
    
    Returns:
        QuizSubmissionResponse with analysis
    """
    try:
        result = quiz_service.submit_quiz(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting quiz: {str(e)}"
        )


@app.get("/api/quiz/availability/{student_id}/{course_id}/{week_number}", response_model=QuizAvailabilityResponse, tags=["Quiz"])
def get_quiz_availability(student_id: str, course_id: str, week_number: int) -> QuizAvailabilityResponse:
    """
    Get quiz availability status for a student.
    
    Args:
        student_id: Student identifier
        course_id: Course identifier
        week_number: Week number
    
    Returns:
        QuizAvailabilityResponse with availability status
    """
    try:
        availability = quiz_service.get_quiz_availability(student_id, course_id, week_number)
        return availability
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking quiz availability: {str(e)}"
        )


@app.get("/api/quiz/week-lock-status/{student_id}/{course_id}/{week_number}", tags=["Quiz"])
def check_week_lock_status(student_id: str, course_id: str, week_number: int) -> dict:
    """
    Check if a week is locked due to incomplete dynamic quiz.
    
    Args:
        student_id: Student identifier
        course_id: Course identifier
        week_number: Week number to check
    
    Returns:
        Dict with lock status
    """
    try:
        is_locked = quiz_service.check_week_lock_status(student_id, course_id, week_number)
        return {
            "studentId": student_id,
            "courseId": course_id,
            "weekNumber": week_number,
            "isLocked": is_locked
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking week lock status: {str(e)}"
        )


@app.get("/api/quiz/student-performance/{student_id}/{course_id}", tags=["Quiz"])
def get_student_performance(student_id: str, course_id: str) -> dict:
    """
    Get student's strengths and weaknesses for a course.
    Backend only - no frontend UI needed.
    
    Args:
        student_id: Student identifier
        course_id: Course identifier
    
    Returns:
        Dict with strengths and weaknesses
    """
    try:
        performance = quiz_service.performance_storage.get_student_performance(student_id, course_id)
        return performance.model_dump()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving student performance: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
