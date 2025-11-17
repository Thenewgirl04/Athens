"""
Service for handling weekly quiz generation, grading, and analysis.
"""
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from models import (
    WeeklyQuiz, WeeklyQuizQuestion, WeeklyQuizAttempt, QuizAnalysis,
    QuizTopicPerformance, QuizSubmissionRequest, QuizSubmissionResponse,
    QuizAvailabilityResponse, QuizProgress, StudentStrengthWeakness
)
from utils.gemini_client import GeminiClient
from storage.quiz_storage import QuizStorage
from storage.curriculum_storage import CurriculumStorage
from storage.strength_weakness_storage import StrengthWeaknessStorage


class QuizService:
    """Service to handle weekly quiz operations."""

    def __init__(self):
        """Initialize quiz service with Gemini client and storage."""
        self.gemini_client = GeminiClient()
        self.storage = QuizStorage()
        self.curriculum_storage = CurriculumStorage()
        self.performance_storage = StrengthWeaknessStorage()

    def generate_main_quiz_for_week(
        self,
        course_id: str,
        week_number: int
    ) -> WeeklyQuiz:
        """
        Generate main quiz for a specific week.
        
        Args:
            course_id: Course identifier
            week_number: Week number
            
        Returns:
            Generated WeeklyQuiz object
        """
        # Load curriculum
        curriculum = self.curriculum_storage.load(course_id)
        if not curriculum or not curriculum.weeks:
            raise ValueError(f"No curriculum found for course {course_id}")

        # Find current week and previous week topics
        current_week = None
        previous_week = None
        
        for week in curriculum.weeks:
            if week.week_number == week_number:
                current_week = week
            elif week.week_number == week_number - 1:
                previous_week = week

        if not current_week:
            raise ValueError(f"Week {week_number} not found in curriculum")

        # Convert topics to dict format for Gemini
        current_topics = [topic.model_dump() for topic in current_week.topics]
        previous_topics = None
        if previous_week:
            previous_topics = [topic.model_dump() for topic in previous_week.topics]

        # Generate quiz questions using Gemini
        gemini_response = self.gemini_client.generate_main_quiz(
            week_number=week_number,
            current_week_topics=current_topics,
            previous_week_topics=previous_topics
        )

        # Parse response
        questions_data = self._parse_quiz_response(gemini_response, current_week.topics)

        # Create quiz
        quiz = WeeklyQuiz(
            id=f"quiz_{course_id}_week{week_number}_main_{uuid.uuid4().hex[:8]}",
            courseId=course_id,
            weekNumber=week_number,
            quizType="main",
            title=f"Week {week_number} Main Quiz",
            description=f"Main quiz for Week {week_number} covering current week's topics and bonus questions from previous week",
            questions=questions_data,
            topicIds=[topic.id for topic in current_week.topics],
            createdAt=datetime.utcnow().isoformat() + "Z",
            maxScore=len(questions_data)
        )

        # Save quiz
        self.storage.save_quiz(quiz)

        return quiz

    def generate_refresher_quiz(
        self,
        course_id: str,
        week_number: int
    ) -> WeeklyQuiz:
        """
        Generate a new refresher quiz for a week.
        Questions change each time but cover same concepts.
        
        Args:
            course_id: Course identifier
            week_number: Week number
            
        Returns:
            Generated WeeklyQuiz object
        """
        # Load curriculum
        curriculum = self.curriculum_storage.load(course_id)
        if not curriculum or not curriculum.weeks:
            raise ValueError(f"No curriculum found for course {course_id}")

        # Find current week
        current_week = None
        for week in curriculum.weeks:
            if week.week_number == week_number:
                current_week = week
                break

        if not current_week:
            raise ValueError(f"Week {week_number} not found in curriculum")

        # Convert topics to dict format for Gemini
        topics = [topic.model_dump() for topic in current_week.topics]

        # Generate quiz questions using Gemini
        gemini_response = self.gemini_client.generate_refresher_quiz(
            week_number=week_number,
            topics=topics
        )

        # Parse response
        questions_data = self._parse_quiz_response(gemini_response, current_week.topics)

        # Create quiz
        quiz = WeeklyQuiz(
            id=f"quiz_{course_id}_week{week_number}_refresher_{uuid.uuid4().hex[:8]}",
            courseId=course_id,
            weekNumber=week_number,
            quizType="refresher",
            title=f"Week {week_number} Refresher Quiz",
            description=f"Optional refresher quiz for Week {week_number} - questions change each time",
            questions=questions_data,
            topicIds=[topic.id for topic in current_week.topics],
            createdAt=datetime.utcnow().isoformat() + "Z",
            maxScore=len(questions_data)
        )

        # Save quiz (will replace existing refresher quiz for this week)
        self.storage.save_quiz(quiz)

        return quiz

    def generate_dynamic_quiz(
        self,
        course_id: str,
        week_number: int,
        student_id: str
    ) -> WeeklyQuiz:
        """
        Generate dynamic quiz targeting student's weak areas.
        
        Args:
            course_id: Course identifier
            week_number: Week number
            student_id: Student identifier
            
        Returns:
            Generated WeeklyQuiz object
        """
        import traceback
        
        try:
            # Load curriculum
            curriculum = self.curriculum_storage.load(course_id)
            if not curriculum or not curriculum.weeks:
                raise ValueError(f"No curriculum found for course {course_id}")

            # Find current week
            current_week = None
            for week in curriculum.weeks:
                if week.week_number == week_number:
                    current_week = week
                    break

            if not current_week:
                raise ValueError(f"Week {week_number} not found in curriculum")

            # Get student's weaknesses
            performance = self.performance_storage.get_student_performance(student_id, course_id)
            weaknesses = performance.weaknesses if performance else []

            # Filter weaknesses to only include topics from current week
            current_week_topic_ids = [topic.id for topic in current_week.topics]
            relevant_weaknesses = [w for w in weaknesses if w in current_week_topic_ids]

            # If no relevant weaknesses found, use all topics from current week as focus areas
            # This can happen if student hasn't taken quizzes for this week yet
            if not relevant_weaknesses:
                # Use all current week topics as focus areas for the dynamic quiz
                relevant_weaknesses = current_week_topic_ids

            # Convert topics to dict format for Gemini
            topics = [topic.model_dump() for topic in current_week.topics]
            
            if not topics:
                raise ValueError(f"No topics found for week {week_number}")

            # Generate quiz questions using Gemini
            try:
                gemini_response = self.gemini_client.generate_dynamic_quiz(
                    week_number=week_number,
                    topics=topics,
                    student_weaknesses=relevant_weaknesses
                )
            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Gemini API error: {error_trace}")
                raise ValueError(f"Failed to generate dynamic quiz questions: {str(e)}")

            # Parse response
            try:
                questions_data = self._parse_quiz_response(gemini_response, current_week.topics)
            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Parse error: {error_trace}")
                print(f"Gemini response: {gemini_response[:1000] if gemini_response else 'None'}")
                raise ValueError(f"Failed to parse dynamic quiz response: {str(e)}")

            # Create quiz
            quiz = WeeklyQuiz(
                id=f"quiz_{course_id}_week{week_number}_dynamic_{student_id}_{uuid.uuid4().hex[:8]}",
                courseId=course_id,
                weekNumber=week_number,
                quizType="dynamic",
                title=f"Week {week_number} Dynamic Quiz",
                description=f"Personalized quiz targeting your weak areas from Week {week_number}",
                questions=questions_data,
                topicIds=[topic.id for topic in current_week.topics],
                createdAt=datetime.utcnow().isoformat() + "Z",
                maxScore=len(questions_data)
            )

            # Save quiz
            self.storage.save_quiz(quiz)

            return quiz
        except ValueError:
            # Re-raise ValueError as-is
            raise
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"Unexpected error in generate_dynamic_quiz: {error_trace}")
            raise ValueError(f"Unexpected error generating dynamic quiz: {str(e)}")

    def submit_quiz(
        self,
        request: QuizSubmissionRequest
    ) -> QuizSubmissionResponse:
        """
        Grade quiz submission and generate analysis.
        
        Args:
            request: Quiz submission with answers
            
        Returns:
            Complete result with analysis
        """
        # Get quiz
        quiz = self.storage.get_quiz(
            request.courseId,
            request.weekNumber,
            request.quizType
        )
        if not quiz:
            raise ValueError(f"No {request.quizType} quiz found for course {request.courseId}, week {request.weekNumber}")

        if quiz.id != request.quizId:
            raise ValueError("Quiz ID mismatch")

        # Check if main quiz already completed (one attempt only)
        if request.quizType == "main":
            if self.storage.has_completed_main_quiz(request.studentId, request.courseId, request.weekNumber):
                raise ValueError("Main quiz can only be taken once per week")

        # Grade answers
        score = 0
        max_score = len(quiz.questions)
        
        for question in quiz.questions:
            student_answer = request.answers.get(question.id)
            if student_answer is not None and student_answer == question.correctAnswer:
                score += 1

        percentage = (score / max_score * 100) if max_score > 0 else 0

        # Generate analysis
        analysis = self._generate_short_analysis(quiz, request.answers)

        # Create attempt
        attempt = WeeklyQuizAttempt(
            id=f"attempt_{uuid.uuid4().hex[:8]}",
            studentId=request.studentId,
            courseId=request.courseId,
            weekNumber=request.weekNumber,
            quizId=request.quizId,
            quizType=request.quizType,
            answers=request.answers,
            score=float(score),
            maxScore=float(max_score),
            percentage=percentage,
            completedAt=datetime.utcnow().isoformat() + "Z",
            analysis=analysis
        )

        # Save attempt
        self.storage.save_attempt(attempt)

        # Update student strengths/weaknesses
        self.performance_storage.update_student_performance(
            request.studentId,
            request.courseId,
            attempt,
            analysis
        )

        return QuizSubmissionResponse(
            success=True,
            message="Quiz submitted successfully",
            attempt=attempt,
            analysis=analysis
        )

    def get_quiz_availability(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> QuizAvailabilityResponse:
        """
        Get quiz availability status for a student.
        
        Args:
            student_id: Student identifier
            course_id: Course identifier
            week_number: Week number
            
        Returns:
            QuizAvailabilityResponse with availability status
        """
        # Check main quiz status
        main_quiz_completed = self.storage.has_completed_main_quiz(student_id, course_id, week_number)
        main_quiz_score = None
        if main_quiz_completed:
            main_quiz_score = self.storage.get_main_quiz_score(student_id, course_id, week_number)

        # Main quiz is available if not completed
        main_quiz_available = not main_quiz_completed

        # Refresher quiz is available after main quiz completion
        refresher_quiz_available = main_quiz_completed

        # Dynamic quiz is available if main quiz completed with score < 60%
        dynamic_quiz_available = False
        dynamic_quiz_required = False
        if main_quiz_completed and main_quiz_score is not None:
            if main_quiz_score < 60:
                dynamic_quiz_available = True
                dynamic_quiz_required = True

        # Check if dynamic quiz is completed
        dynamic_quiz_completed = self.storage.has_completed_dynamic_quiz(student_id, course_id, week_number)

        return QuizAvailabilityResponse(
            weekNumber=week_number,
            mainQuizAvailable=main_quiz_available,
            mainQuizCompleted=main_quiz_completed,
            mainQuizScore=main_quiz_score,
            refresherQuizAvailable=refresher_quiz_available,
            dynamicQuizAvailable=dynamic_quiz_available,
            dynamicQuizRequired=dynamic_quiz_required,
            dynamicQuizCompleted=dynamic_quiz_completed
        )

    def check_week_lock_status(
        self,
        student_id: str,
        course_id: str,
        week_number: int
    ) -> bool:
        """
        Check if a week is locked due to incomplete dynamic quiz.
        
        Args:
            student_id: Student identifier
            course_id: Course identifier
            week_number: Week number to check
            
        Returns:
            True if week is locked, False otherwise
        """
        # Week is locked if:
        # 1. Previous week's main quiz was completed with score < 60%
        # 2. Dynamic quiz for previous week is required but not completed
        
        if week_number <= 1:
            return False  # First week is never locked

        prev_week = week_number - 1
        
        # Check if main quiz was completed
        main_completed = self.storage.has_completed_main_quiz(student_id, course_id, prev_week)
        if not main_completed:
            return False  # Can't be locked if main quiz not completed

        # Check main quiz score
        main_score = self.storage.get_main_quiz_score(student_id, course_id, prev_week)
        if main_score is None or main_score >= 60:
            return False  # Not locked if score >= 60%

        # Check if dynamic quiz is completed
        dynamic_completed = self.storage.has_completed_dynamic_quiz(student_id, course_id, prev_week)
        
        # Week is locked if dynamic quiz is required but not completed
        return not dynamic_completed

    def _parse_quiz_response(
        self,
        response_text: str,
        topics: List[Any]
    ) -> List[WeeklyQuizQuestion]:
        """
        Parse Gemini's JSON response into WeeklyQuizQuestion objects.
        
        Args:
            response_text: Raw JSON string from Gemini
            topics: List of topic objects for topic title mapping
            
        Returns:
            List of WeeklyQuizQuestion objects
        """
        if not response_text:
            raise ValueError("Empty response from Gemini API")
        
        # Extract JSON from response
        try:
            json_str = self._extract_json(response_text)
        except ValueError as e:
            raise ValueError(f"Could not extract JSON from Gemini response: {str(e)}\nResponse: {response_text[:500]}")
        
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in Gemini response: {str(e)}\nJSON string: {json_str[:500]}")

        # Validate that questions exist
        if "questions" not in data:
            raise ValueError(f"No 'questions' key found in Gemini response. Response keys: {list(data.keys())}")
        
        questions_list = data.get("questions", [])
        if not questions_list:
            raise ValueError("Gemini returned an empty questions list")
        
        # Create topic mapping for reference
        topic_map = {}
        for topic in topics:
            topic_map[topic.id] = topic.title

        # Convert to WeeklyQuizQuestion objects
        questions = []
        for idx, q_data in enumerate(questions_list):
            try:
                question = WeeklyQuizQuestion(
                    id=q_data.get("id", f"q_{idx + 1}"),
                    question=q_data.get("question", ""),
                    options=q_data.get("options", []),
                    correctAnswer=q_data.get("correctAnswer", 0),
                    topicId=q_data.get("topicId"),
                    topicTitle=q_data.get("topicTitle") or topic_map.get(q_data.get("topicId", ""), ""),
                    conceptId=q_data.get("conceptId"),
                    difficultyLevel=q_data.get("difficultyLevel", "medium"),
                    isBonus=q_data.get("isBonus", False)
                )
                questions.append(question)
            except Exception as e:
                raise ValueError(f"Error creating question {idx + 1}: {str(e)}\nQuestion data: {q_data}")

        if not questions:
            raise ValueError("No valid questions were created from Gemini response")
        
        return questions

    def _extract_json(self, text: str) -> str:
        """Extract JSON from text (handles cases where Gemini adds extra text)."""
        start = text.find('{')
        end = text.rfind('}')
        
        if start == -1 or end == -1:
            raise ValueError("No valid JSON found in Gemini response")
        
        return text[start:end+1]

    def _generate_short_analysis(
        self,
        quiz: WeeklyQuiz,
        answers: Dict[str, int]
    ) -> QuizAnalysis:
        """
        Generate short SAT-style performance analysis.
        
        Args:
            quiz: The quiz questions
            answers: Student's answers
            
        Returns:
            QuizAnalysis object
        """
        # Calculate topic-level performance
        topic_stats: Dict[str, Dict[str, Any]] = {}
        
        for question in quiz.questions:
            topic_id = question.topicId or "unknown"
            topic_title = question.topicTitle or "Unknown Topic"
            
            if topic_id not in topic_stats:
                topic_stats[topic_id] = {
                    "topicId": topic_id,
                    "topicTitle": topic_title,
                    "questionsCount": 0,
                    "correctCount": 0,
                    "incorrectCount": 0
                }
            
            topic_stats[topic_id]["questionsCount"] += 1
            student_answer = answers.get(question.id)
            if student_answer is not None and student_answer == question.correctAnswer:
                topic_stats[topic_id]["correctCount"] += 1
            else:
                topic_stats[topic_id]["incorrectCount"] += 1

        # Convert to QuizTopicPerformance objects
        topic_breakdown = []
        total_correct = 0
        total_incorrect = 0
        
        for topic_id, stats in topic_stats.items():
            percentage = (stats["correctCount"] / stats["questionsCount"] * 100) if stats["questionsCount"] > 0 else 0
            
            if percentage >= 80:
                performance_level = "strong"
            elif percentage >= 60:
                performance_level = "moderate"
            else:
                performance_level = "weak"

            topic_breakdown.append(QuizTopicPerformance(
                topicId=stats["topicId"],
                topicTitle=stats["topicTitle"],
                questionsCount=stats["questionsCount"],
                correctCount=stats["correctCount"],
                incorrectCount=stats["incorrectCount"],
                percentage=percentage,
                performanceLevel=performance_level
            ))
            
            total_correct += stats["correctCount"]
            total_incorrect += stats["incorrectCount"]

        # Calculate overall score
        total_questions = total_correct + total_incorrect
        overall_score = total_correct
        max_score = total_questions
        percentage = (overall_score / max_score * 100) if max_score > 0 else 0

        # Determine overall performance level
        if percentage < 60:
            performance_level = "fail"
        elif percentage < 85:
            performance_level = "below_moderate"
        else:
            performance_level = "moderate_plus"

        return QuizAnalysis(
            overallScore=float(overall_score),
            maxScore=float(max_score),
            percentage=percentage,
            performanceLevel=performance_level,
            topicBreakdown=topic_breakdown,
            correctCount=total_correct,
            incorrectCount=total_incorrect
        )

