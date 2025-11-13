"""Persistent storage helpers for generated curriculum data."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from models import CurriculumGenerationResponse


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

        return CurriculumGenerationResponse(**data)
