"""
File storage handler for lesson file uploads.
"""
import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile


class FileStorage:
    """Handles file storage for lesson materials."""
    
    def __init__(self, base_dir: str = "storage/lesson_files"):
        """
        Initialize file storage.
        
        Args:
            base_dir: Base directory for storing lesson files
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
    
    def save_file(
        self,
        course_id: str,
        lesson_id: str,
        file: UploadFile,
        filename: Optional[str] = None
    ) -> str:
        """
        Save an uploaded file for a lesson.
        
        Args:
            course_id: Course identifier
            lesson_id: Lesson identifier
            file: Uploaded file object
            filename: Optional custom filename (uses original if not provided)
        
        Returns:
            Relative file path
        """
        # Create directory structure: storage/lesson_files/{course_id}/{lesson_id}/
        lesson_dir = self.base_dir / course_id / lesson_id
        lesson_dir.mkdir(parents=True, exist_ok=True)
        
        # Use provided filename or original filename
        if filename:
            file_path = lesson_dir / filename
        else:
            file_path = lesson_dir / file.filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative path from base_dir
        relative_path = file_path.relative_to(self.base_dir)
        return str(relative_path)
    
    def get_file_path(self, relative_path: str) -> Path:
        """
        Get full file path from relative path.
        
        Args:
            relative_path: Relative path from base_dir
        
        Returns:
            Full Path object
        """
        return self.base_dir / relative_path
    
    def file_exists(self, relative_path: str) -> bool:
        """
        Check if a file exists.
        
        Args:
            relative_path: Relative path from base_dir
        
        Returns:
            True if file exists, False otherwise
        """
        file_path = self.get_file_path(relative_path)
        return file_path.exists()
    
    def delete_file(self, relative_path: str) -> bool:
        """
        Delete a file.
        
        Args:
            relative_path: Relative path from base_dir
        
        Returns:
            True if deleted, False if not found
        """
        file_path = self.get_file_path(relative_path)
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    
    def delete_lesson_directory(self, course_id: str, lesson_id: str) -> bool:
        """
        Delete entire lesson directory.
        
        Args:
            course_id: Course identifier
            lesson_id: Lesson identifier
        
        Returns:
            True if deleted, False if not found
        """
        lesson_dir = self.base_dir / course_id / lesson_id
        if lesson_dir.exists():
            shutil.rmtree(lesson_dir)
            return True
        return False
    
    def get_file_size(self, relative_path: str) -> Optional[int]:
        """
        Get file size in bytes.
        
        Args:
            relative_path: Relative path from base_dir
        
        Returns:
            File size in bytes, or None if file doesn't exist
        """
        file_path = self.get_file_path(relative_path)
        if file_path.exists():
            return file_path.stat().st_size
        return None
    
    def format_file_size(self, size_bytes: int) -> str:
        """
        Format file size in human-readable format.
        
        Args:
            size_bytes: File size in bytes
        
        Returns:
            Formatted string (e.g., "2.5 MB")
        """
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"

