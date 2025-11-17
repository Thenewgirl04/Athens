"""
Google Gemini API client wrapper.
"""
import google.generativeai as genai
from google.api_core.exceptions import NotFound
from config import settings
from typing import List, Dict, Any


class GeminiClient:
    """Wrapper for Google Generative AI (Gemini) API."""
    
    def __init__(self):
        """Initialize Gemini client with API key and configured model."""
        genai.configure(api_key=settings.google_api_key)
        try:
            self.model = genai.GenerativeModel(settings.gemini_model)
        except NotFound as exc:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' not found. Check your GEMINI_MODEL setting."
            ) from exc
        except Exception as exc:
            raise RuntimeError(
                f"Failed to initialize Gemini model '{settings.gemini_model}': {exc}"
            ) from exc
    
    def generate_curriculum(
        self,
        content: str,
        number_of_weeks: int,
        include_study_materials: bool,
        include_media_links: bool
    ) -> str:
        """
        Call Gemini API to generate curriculum from rough outline.
        
        Args:
            content: User's rough syllabus or outline text
            number_of_weeks: Number of weeks for the course
            include_study_materials: Include study materials in response
            include_media_links: Include media links in response
        
        Returns:
            Raw JSON string from Gemini
        """
        prompt = self._build_prompt(
            content,
            number_of_weeks,
            include_study_materials,
            include_media_links
        )
        try:
            response = self.model.generate_content(prompt)
        except NotFound as exc:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' cannot generate content: {exc}"
            ) from exc
        return response.text
    
    def _build_prompt(
        self,
        content: str,
        number_of_weeks: int,
        include_study_materials: bool,
        include_media_links: bool
    ) -> str:
        """
        Build the prompt to send to Gemini.
        
        Args:
            content: User's rough syllabus or outline
            number_of_weeks: Number of weeks
            include_study_materials: Include study materials flag
            include_media_links: Include media links flag
        
        Returns:
            Formatted prompt string
        """
        resources_instruction = ""
        if include_study_materials or include_media_links:
            resources_instruction = "\nInclude relevant resources such as:"
            if include_study_materials:
                resources_instruction += "\n- Study materials (documentation, tutorials, books)"
            if include_media_links:
                resources_instruction += "\n- Media links (YouTube videos, online courses, podcasts)"
        
        prompt = f"""You are a curriculum design expert. Given a rough course outline, expand it into a comprehensive curriculum.

Rough Outline:
{content}

Requirements:
- Create a curriculum for exactly {number_of_weeks} weeks
- Each week should have a clear title and 3-5 topics
- Each topic should have: id (format: "topic_[week]_[number]"), title, and a detailed description
{resources_instruction}
- For each resource, specify the type: "article" (links to read), "video" (videos to watch), "pdf" (PDF documents), or "course" (online courses)
- Return the response as valid JSON only (no markdown, no extra text)

JSON Format:
{{
  "weeks": [
    {{
      "week_number": 1,
      "title": "Week Title",
      "topics": [
        {{
          "id": "topic_1_1",
          "title": "Topic Title",
          "description": "Detailed description",
          "resources": [
            {{
              "url": "https://example.com/article",
              "type": "article"
            }},
            {{
              "url": "https://youtube.com/watch?v=example",
              "type": "video"
            }}
          ]
        }}
      ]
    }}
  ]
}}

Generate the comprehensive curriculum now:"""
        
        return prompt
    
    def generate_lesson_notes(
        self,
        topic_title: str,
        topic_description: str,
        topic_resources: List = None
    ) -> str:
        """
        Call Gemini API to generate detailed lesson notes for a topic.
        
        Args:
            topic_title: The title of the topic
            topic_description: The description of the topic
            topic_resources: Optional list of resources for the topic
        
        Returns:
            Raw JSON string from Gemini
        """
        prompt = self._build_lesson_notes_prompt(
            topic_title,
            topic_description,
            topic_resources or []
        )
        try:
            response = self.model.generate_content(prompt)
        except NotFound as exc:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' cannot generate content: {exc}"
            ) from exc
        return response.text
    
    def _build_lesson_notes_prompt(
        self,
        topic_title: str,
        topic_description: str,
        topic_resources: List
    ) -> str:
        """
        Build the prompt for generating lesson notes.
        
        Args:
            topic_title: Title of the topic
            topic_description: Description of the topic
            topic_resources: List of resources for the topic
        
        Returns:
            Formatted prompt string
        """
        resources_context = ""
        if topic_resources:
            resources_context = "\n\nAvailable Resources:"
            for resource in topic_resources:
                if hasattr(resource, 'url') and hasattr(resource, 'type'):
                    resources_context += f"\n- [{resource.type}] {resource.url}"
                elif isinstance(resource, dict):
                    resources_context += f"\n- [{resource.get('type', 'link')}] {resource.get('url', '')}"
        
        prompt = f"""You are an expert educator creating detailed lesson notes for a topic. Generate comprehensive lesson notes that will help teachers deliver an effective lesson.

Topic: {topic_title}

Description: {topic_description}
{resources_context}

Create detailed lesson notes with the following structure:
1. **Introduction** - Brief overview and learning objectives
2. **Detailed Explanation** - Core concepts and key points explained thoroughly
3. **Practical Examples** - 2-3 concrete examples demonstrating the concepts
4. **Learning Activities** - 2-3 hands-on activities or exercises for student engagement
5. **Summary** - Key takeaways and recap

Requirements:
- Make content clear, engaging, and appropriate for teaching
- Include specific examples that illustrate the concepts
- Provide activities that promote active learning and understanding
- Estimate the total lesson duration
- Return the response as valid JSON only (no markdown, no extra text)

JSON Format:
{{
  "sections": [
    {{
      "section_type": "introduction",
      "title": "Introduction",
      "content": "Overview and learning objectives..."
    }},
    {{
      "section_type": "explanation",
      "title": "Core Concepts",
      "content": "Detailed explanation of key concepts..."
    }},
    {{
      "section_type": "example",
      "title": "Example 1: [Specific Example Title]",
      "content": "Concrete example demonstrating the concept..."
    }},
    {{
      "section_type": "example",
      "title": "Example 2: [Another Example Title]",
      "content": "Another practical example..."
    }},
    {{
      "section_type": "activity",
      "title": "Activity 1: [Activity Name]",
      "content": "Hands-on activity description with instructions..."
    }},
    {{
      "section_type": "activity",
      "title": "Activity 2: [Another Activity Name]",
      "content": "Another engaging activity..."
    }},
    {{
      "section_type": "summary",
      "title": "Key Takeaways",
      "content": "Summary of main points and learning outcomes..."
    }}
  ],
  "estimated_duration": "45 minutes"
}}

Generate the detailed lesson notes now:"""
        
        return prompt
    
    def generate_pretest(
        self,
        curriculum_data: Dict[str, Any]
    ) -> str:
        """
        Generate pretest questions based on curriculum topics.
        
        Args:
            curriculum_data: Dictionary containing curriculum weeks and topics
            
        Returns:
            Raw JSON string from Gemini with pretest questions
        """
        prompt = self._build_pretest_prompt(curriculum_data)
        try:
            response = self.model.generate_content(prompt)
        except NotFound as exc:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' cannot generate content: {exc}"
            ) from exc
        return response.text
    
    def _build_pretest_prompt(self, curriculum_data: Dict[str, Any]) -> str:
        """
        Build prompt for pretest generation.
        
        Args:
            curriculum_data: Curriculum data with weeks and topics
            
        Returns:
            Formatted prompt string
        """
        # Extract topics from curriculum
        topics_list = []
        for week in curriculum_data.get("weeks", []):
            for topic in week.get("topics", []):
                topics_list.append({
                    "id": topic.get("id", ""),
                    "title": topic.get("title", ""),
                    "description": topic.get("description", "")
                })
        
        topics_text = "\n".join([
            f"- {t['id']}: {t['title']} - {t['description']}"
            for t in topics_list
        ])
        
        prompt = f"""You are an expert test creator. Generate a comprehensive pretest to assess students' prior knowledge across all topics in this course curriculum.

Curriculum Topics:
{topics_text}

Requirements:
- Generate 10-15 multiple choice questions total
- Each question must have exactly 4 options (A, B, C, D)
- Questions should cover all major topics from the curriculum
- Questions should assess foundational knowledge and prerequisite concepts
- Mix easy, medium, and challenging questions
- For each question, specify which topic it relates to (use the topic ID)
- Return the response as valid JSON only (no markdown, no extra text)

JSON Format:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "What is the primary purpose of React hooks?",
      "options": [
        "To manage component state and side effects",
        "To style React components",
        "To handle routing in React applications",
        "To optimize React component rendering"
      ],
      "correctAnswer": 0,
      "topicId": "topic_1_1",
      "topicTitle": "Introduction to React"
    }}
  ]
}}

Generate the pretest questions now:"""
        
        return prompt
    
    def generate_recommendation(
        self,
        topic_id: str,
        topic_title: str,
        topic_description: str,
        student_performance: str
    ) -> str:
        """
        Generate a resource recommendation for a weak topic area.
        
        Args:
            topic_id: Topic identifier
            topic_title: Title of the topic
            topic_description: Description of the topic
            student_performance: Description of student's performance on this topic
            
        Returns:
            Raw JSON string from Gemini with recommendation
        """
        prompt = self._build_recommendation_prompt(
            topic_id, topic_title, topic_description, student_performance
        )
        try:
            response = self.model.generate_content(prompt)
        except NotFound as exc:
            raise RuntimeError(
                f"Gemini model '{settings.gemini_model}' cannot generate content: {exc}"
            ) from exc
        return response.text
    
    def _build_recommendation_prompt(
        self,
        topic_id: str,
        topic_title: str,
        topic_description: str,
        student_performance: str
    ) -> str:
        """
        Build prompt for recommendation generation.
        
        Args:
            topic_id: Topic identifier
            topic_title: Title of the topic
            topic_description: Description of the topic
            student_performance: Description of student's performance
            
        Returns:
            Formatted prompt string
        """
        prompt = f"""You are an educational advisor. A student needs help with a specific topic they struggled with on a pretest.

Topic: {topic_title}
Description: {topic_description}
Student Performance: {student_performance}

Generate ONE targeted learning resource recommendation:
- Provide a specific, high-quality online resource (article, video, course, or PDF)
- The resource should be appropriate for someone learning this topic from scratch or needing reinforcement
- Include a brief explanation of why this resource will help
- Return the response as valid JSON only (no markdown, no extra text)

JSON Format:
{{
  "topicId": "{topic_id}",
  "topicTitle": "{topic_title}",
  "recommendation": "Brief explanation of why this topic needs attention and how the resource helps",
  "resourceUrl": "https://example.com/resource",
  "resourceType": "article"
}}

Resource types: "article" (articles, tutorials, documentation), "video" (YouTube, educational videos), "course" (online courses like Coursera, Khan Academy), or "pdf" (PDF documents)

Generate the recommendation now:"""
        
        return prompt