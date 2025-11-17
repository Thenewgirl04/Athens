"""
Service for handling pretest generation, grading, and analysis.
"""
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from models import (
    Pretest, PretestQuestion, PretestAttempt, PretestAnalysis,
    TopicPerformance, TopicRecommendation, PretestResultResponse,
    PretestSubmissionRequest, CurriculumGenerationResponse
)
from utils.gemini_client import GeminiClient
from storage.pretest_storage import PretestStorage
from storage.curriculum_storage import CurriculumStorage


class PretestService:
    """Service to handle pretest operations."""

    def __init__(self):
        """Initialize pretest service with Gemini client and storage."""
        self.gemini_client = GeminiClient()
        self.storage = PretestStorage()
        self.curriculum_storage = CurriculumStorage()

    def generate_pretest_for_curriculum(self, course_id: str) -> Pretest:
        """
        Generate pretest for a course based on its curriculum.
        
        Args:
            course_id: Course identifier
            
        Returns:
            Generated Pretest object
        """
        # Load curriculum
        curriculum = self.curriculum_storage.load(course_id)
        if not curriculum or not curriculum.weeks:
            raise ValueError(f"No curriculum found for course {course_id}")

        # Convert curriculum to dict for Gemini
        curriculum_dict = curriculum.model_dump()

        # Generate pretest questions using Gemini
        gemini_response = self.gemini_client.generate_pretest(curriculum_dict)

        # Parse response
        questions_data = self._parse_pretest_response(gemini_response, curriculum)

        # Create pretest
        pretest = Pretest(
            id=f"pretest_{course_id}_{uuid.uuid4().hex[:8]}",
            courseId=course_id,
            questions=questions_data,
            createdAt=datetime.utcnow().isoformat() + "Z",
            maxScore=len(questions_data)
        )

        # Save pretest
        self.storage.save_pretest(pretest)

        return pretest

    def get_pretest(self, course_id: str) -> Optional[Pretest]:
        """Retrieve pretest for a course."""
        return self.storage.get_pretest(course_id)

    def submit_pretest(
        self,
        request: PretestSubmissionRequest
    ) -> PretestResultResponse:
        """
        Grade pretest submission and generate analysis.
        
        Args:
            request: Pretest submission with answers
            
        Returns:
            Complete result with analysis and recommendations
        """
        # Get pretest
        pretest = self.storage.get_pretest(request.courseId)
        if not pretest:
            raise ValueError(f"No pretest found for course {request.courseId}")

        if pretest.id != request.pretestId:
            raise ValueError("Pretest ID mismatch")

        # Grade answers
        score = 0
        max_score = len(pretest.questions)
        
        for question in pretest.questions:
            student_answer = request.answers.get(question.id)
            if student_answer is not None and student_answer == question.correctAnswer:
                score += 1

        percentage = (score / max_score * 100) if max_score > 0 else 0

        # Create attempt
        attempt = PretestAttempt(
            id=f"attempt_{uuid.uuid4().hex[:8]}",
            studentId=request.studentId,
            courseId=request.courseId,
            pretestId=request.pretestId,
            answers=request.answers,
            score=float(score),
            maxScore=float(max_score),
            percentage=percentage,
            completedAt=datetime.utcnow().isoformat() + "Z"
        )

        # Save attempt
        self.storage.save_attempt(attempt)

        # Generate analysis
        analysis = self._generate_analysis(pretest, attempt, request.answers)

        # Generate recommendation if score < 85%
        recommendation = None
        if percentage < 85:
            recommendation = self._generate_recommendation(
                pretest, analysis, request.courseId
            )

        return PretestResultResponse(
            attempt=attempt,
            analysis=analysis,
            recommendation=recommendation
        )

    def has_completed_pretest(self, student_id: str, course_id: str) -> bool:
        """Check if student has completed pretest."""
        return self.storage.has_completed_pretest(student_id, course_id)

    def get_pretest_result(
        self,
        student_id: str,
        course_id: str
    ) -> Optional[PretestResultResponse]:
        """Get existing pretest result for a student."""
        attempt = self.storage.get_attempt(student_id, course_id)
        if not attempt:
            return None

        pretest = self.storage.get_pretest(course_id)
        if not pretest:
            return None

        # Regenerate analysis (in case we need to recalculate)
        analysis = self._generate_analysis(pretest, attempt, attempt.answers)

        # Generate recommendation if needed
        recommendation = None
        if attempt.percentage < 85:
            recommendation = self._generate_recommendation(
                pretest, analysis, course_id
            )

        return PretestResultResponse(
            attempt=attempt,
            analysis=analysis,
            recommendation=recommendation
        )

    def _parse_pretest_response(
        self,
        response_text: str,
        curriculum: CurriculumGenerationResponse
    ) -> List[PretestQuestion]:
        """
        Parse Gemini's JSON response into PretestQuestion objects.
        
        Args:
            response_text: Raw JSON string from Gemini
            curriculum: Curriculum data for topic mapping
            
        Returns:
            List of PretestQuestion objects
        """
        # Extract JSON from response
        json_str = self._extract_json(response_text)
        data = json.loads(json_str)

        # Create topic mapping for reference
        topic_map = {}
        for week in curriculum.weeks:
            for topic in week.topics:
                topic_map[topic.id] = topic.title

        # Convert to PretestQuestion objects
        questions = []
        for q_data in data.get("questions", []):
            question = PretestQuestion(
                id=q_data.get("id", f"q_{len(questions) + 1}"),
                question=q_data.get("question", ""),
                options=q_data.get("options", []),
                correctAnswer=q_data.get("correctAnswer", 0),
                topicId=q_data.get("topicId"),
                topicTitle=q_data.get("topicTitle") or topic_map.get(q_data.get("topicId", ""), "")
            )
            questions.append(question)

        return questions

    def _extract_json(self, text: str) -> str:
        """Extract JSON from text (handles cases where Gemini adds extra text)."""
        start = text.find('{')
        end = text.rfind('}')
        
        if start == -1 or end == -1:
            raise ValueError("No valid JSON found in Gemini response")
        
        return text[start:end+1]

    def _generate_analysis(
        self,
        pretest: Pretest,
        attempt: PretestAttempt,
        answers: Dict[str, int]
    ) -> PretestAnalysis:
        """
        Generate SAT-style performance analysis.
        
        Args:
            pretest: The pretest questions
            attempt: Student's attempt
            answers: Student's answers
            
        Returns:
            PretestAnalysis object
        """
        # Calculate topic-level performance
        topic_stats: Dict[str, Dict[str, Any]] = {}
        
        for question in pretest.questions:
            topic_id = question.topicId or "unknown"
            topic_title = question.topicTitle or "Unknown Topic"
            
            if topic_id not in topic_stats:
                topic_stats[topic_id] = {
                    "topicId": topic_id,
                    "topicTitle": topic_title,
                    "questionsCount": 0,
                    "correctCount": 0
                }
            
            topic_stats[topic_id]["questionsCount"] += 1
            student_answer = answers.get(question.id)
            if student_answer is not None and student_answer == question.correctAnswer:
                topic_stats[topic_id]["correctCount"] += 1

        # Convert to TopicPerformance objects
        topic_breakdown = []
        strengths = []
        weaknesses = []
        
        for topic_id, stats in topic_stats.items():
            percentage = (stats["correctCount"] / stats["questionsCount"] * 100) if stats["questionsCount"] > 0 else 0
            
            if percentage >= 80:
                performance_level = "strong"
                strengths.append(stats["topicTitle"])
            elif percentage >= 60:
                performance_level = "moderate"
            else:
                performance_level = "weak"
                weaknesses.append(stats["topicTitle"])

            topic_breakdown.append(TopicPerformance(
                topicId=stats["topicId"],
                topicTitle=stats["topicTitle"],
                questionsCount=stats["questionsCount"],
                correctCount=stats["correctCount"],
                percentage=percentage,
                performanceLevel=performance_level
            ))

        # Determine overall performance level
        if attempt.percentage < 70:
            performance_level = "fail"
        elif attempt.percentage < 85:
            performance_level = "below_moderate"
        else:
            performance_level = "moderate_plus"

        return PretestAnalysis(
            overallScore=attempt.score,
            maxScore=attempt.maxScore,
            percentage=attempt.percentage,
            performanceLevel=performance_level,
            topicBreakdown=topic_breakdown,
            strengths=strengths,
            weaknesses=weaknesses
        )

    def _generate_recommendation(
        self,
        pretest: Pretest,
        analysis: PretestAnalysis,
        course_id: str
    ) -> Optional[TopicRecommendation]:
        """
        Generate resource recommendation for weakest topic area.
        
        Args:
            pretest: The pretest questions
            analysis: Performance analysis
            course_id: Course identifier
            
        Returns:
            TopicRecommendation or None
        """
        if not analysis.weaknesses:
            return None

        # Find the weakest topic
        weakest_topic = None
        lowest_percentage = 100
        
        for topic_perf in analysis.topicBreakdown:
            if topic_perf.performanceLevel == "weak" and topic_perf.percentage < lowest_percentage:
                lowest_percentage = topic_perf.percentage
                weakest_topic = topic_perf

        if not weakest_topic:
            # Fall back to first weakness if no weak topics found
            for topic_perf in analysis.topicBreakdown:
                if topic_perf.percentage < 85:
                    weakest_topic = topic_perf
                    break

        if not weakest_topic:
            return None

        # Get curriculum for topic description
        curriculum = self.curriculum_storage.load(course_id)
        topic_description = ""
        if curriculum:
            for week in curriculum.weeks:
                for topic in week.topics:
                    if topic.id == weakest_topic.topicId:
                        topic_description = topic.description
                        break

        # Generate recommendation using Gemini
        performance_desc = f"Scored {weakest_topic.correctCount} out of {weakest_topic.questionsCount} questions ({weakest_topic.percentage:.1f}%)"
        
        gemini_response = self.gemini_client.generate_recommendation(
            topic_id=weakest_topic.topicId,
            topic_title=weakest_topic.topicTitle,
            topic_description=topic_description,
            student_performance=performance_desc
        )

        # Parse recommendation
        json_str = self._extract_json(gemini_response)
        rec_data = json.loads(json_str)

        return TopicRecommendation(
            topicId=rec_data.get("topicId", weakest_topic.topicId),
            topicTitle=rec_data.get("topicTitle", weakest_topic.topicTitle),
            recommendation=rec_data.get("recommendation", ""),
            resourceUrl=rec_data.get("resourceUrl", ""),
            resourceType=rec_data.get("resourceType", "article")
        )

