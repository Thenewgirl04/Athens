"""
Google Gemini API client wrapper.
"""
import google.generativeai as genai
from google.api_core.exceptions import NotFound
from config import settings


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
          "resources": ["url1", "url2"]
        }}
      ]
    }}
  ]
}}

Generate the comprehensive curriculum now:"""
        
        return prompt