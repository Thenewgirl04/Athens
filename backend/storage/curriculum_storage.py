"""Persistent storage helpers for generated curriculum data."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional, List, Union, Dict, Any

from models import CurriculumGenerationResponse, Resource


class CurriculumStorage:
    """Minimal JSON file storage for curriculum data."""

    def __init__(self, base_dir: Optional[Path] = None) -> None:
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent / "data"
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _file_path(self, course_id: str) -> Path:
        safe_id = course_id.replace("/", "_")[0:100]
        return self.base_dir / f"curriculum_{safe_id}.json"

    def save(self, curriculum: CurriculumGenerationResponse) -> None:
        if not curriculum.course_id:
            raise ValueError("Curriculum response must include course_id to be saved")

        path = self._file_path(curriculum.course_id)
        with path.open("w", encoding="utf-8") as f:
            json.dump(curriculum.model_dump(), f, ensure_ascii=False, indent=2)

    def load(self, course_id: str) -> Optional[CurriculumGenerationResponse]:
        path = self._file_path(course_id)
        if not path.exists():
            return None

        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)

        # Convert old format resources (strings) to new format (Resource objects)
        data = self._convert_resources_format(data)

        return CurriculumGenerationResponse(**data)
    
    def _convert_resources_format(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert old format resources (strings) to new format (Resource objects).
        This provides backward compatibility with existing curriculum files.
        
        Args:
            data: Raw curriculum data dictionary
        
        Returns:
            Data dictionary with resources converted to Resource objects
        """
        if "weeks" not in data:
            return data
        
        for week in data.get("weeks", []):
            for topic in week.get("topics", []):
                resources = topic.get("resources", [])
                if resources:
                    converted_resources = []
                    for resource in resources:
                        if isinstance(resource, str):
                            # Old format: plain string URL
                            resource_type = self._infer_resource_type(resource)
                            converted_resources.append({
                                "url": resource,
                                "type": resource_type
                            })
                        elif isinstance(resource, dict):
                            # New format: already has url and type
                            if "url" in resource and "type" in resource:
                                converted_resources.append(resource)
                            elif "url" in resource:
                                # Has URL but missing type, infer it
                                resource_type = self._infer_resource_type(resource["url"])
                                converted_resources.append({
                                    "url": resource["url"],
                                    "type": resource_type
                                })
                            else:
                                # Invalid format, skip
                                continue
                        else:
                            # Unknown format, skip
                            continue
                    topic["resources"] = converted_resources
        
        return data
    
    def _infer_resource_type(self, url: str) -> str:
        """
        Infer resource type from URL patterns.
        
        Args:
            url: The resource URL
        
        Returns:
            Resource type: "video", "pdf", "course", or "article" (default)
        """
        url_lower = url.lower()
        
        # Video platforms
        if any(domain in url_lower for domain in ['youtube.com', 'youtu.be', 'vimeo.com']):
            return "video"
        
        # PDF documents
        if url_lower.endswith('.pdf'):
            return "pdf"
        
        # Online course platforms
        if any(domain in url_lower for domain in ['coursera.org', 'edx.org', 'udemy.com', 'khanacademy.org']):
            return "course"
        
        # Default to article
        return "article"
