import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle,
  Download,
  Link as LinkIcon,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Note, Module } from './ModulesTab';

interface NoteDetailPageProps {
  note: Note;
  module: Module;
  currentNoteNumber: number;
  totalNotes: number;
  onBack: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  courseId?: string;
}

export function NoteDetailPage({
  note,
  module,
  currentNoteNumber,
  totalNotes,
  onBack,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  courseId = "1",
}: NoteDetailPageProps) {
  const progress = (currentNoteNumber / totalNotes) * 100;

  // Markdown parser function to convert markdown to HTML
  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    
    // Escape HTML to prevent XSS
    const escapeHtml = (str: string) => {
      const map: { [key: string]: string } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return str.replace(/[&<>"']/g, (m) => map[m]);
    };
    
    // Split into lines for processing
    const lines = text.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a bullet list item
      if (line.match(/^\* (.+)$/)) {
        const listContent = line.replace(/^\* (.+)$/, '$1');
        if (!inList) {
          processedLines.push('<ul>');
          inList = true;
        }
        // Process bold and italic within list items
        let processedContent = escapeHtml(listContent);
        processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        processedLines.push(`<li>${processedContent}</li>`);
      } else {
        // Close list if we were in one
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        
        // Process regular lines
        if (line) {
          let processedLine = escapeHtml(line);
          // Convert **bold** to <strong>bold</strong> first
          processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          // Convert *italic* to <em>italic</em> (simple match, avoiding **)
          processedLine = processedLine.replace(/([^*]|^)\*([^*\n]+?)\*([^*]|$)/g, "$1<em>$2</em>$3");
          processedLines.push(`<p>${processedLine}</p>`);
        } else {
          // Empty line - add paragraph break
          processedLines.push('');
        }
      }
    }
    
    // Close list if still open
    if (inList) {
      processedLines.push('</ul>');
    }
    
    // Join and clean up
    let html = processedLines.join('\n');
    
    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/\n\n+/g, '\n');
    
    return html.trim();
  };

  const getLessonTypeIcon = () => {
    switch (note.type) {
      case "ai_generated":
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case "file_video":
        return <Video className="w-5 h-5 text-purple-600" />;
      case "file_pdf":
        return <FileText className="w-5 h-5 text-red-600" />;
      case "link":
        return <LinkIcon className="w-5 h-5 text-blue-600" />;
      case "file_document":
      case "manual_rich_text":
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getLessonTypeLabel = () => {
    switch (note.type) {
      case "ai_generated":
        return "AI Generated";
      case "file_video":
        return "Video";
      case "file_pdf":
        return "PDF Document";
      case "link":
        return "External Link";
      case "file_document":
        return "Document";
      case "manual_rich_text":
        return "Rich Text";
      default:
        return "Lesson";
    }
  };

  // Render file-based lesson
  const renderFileLesson = () => {
    const API_BASE_URL = 'http://localhost:8000';
    const fileUrl = note.file_url
      ? `${API_BASE_URL}/api/lessons/file/${courseId}/${note.id}/${note.file_url.split("/").pop()}`
      : null;

    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          {getLessonTypeIcon()}
          <h3 className="text-lg font-semibold mt-4 mb-2">{note.title}</h3>
          <p className="text-slate-600 mb-6">
            {getLessonTypeLabel()} - Click below to download or view
          </p>
          {fileUrl && (
            <Button
              size="lg"
              className="gap-2"
              asChild
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5" />
                {note.type === "file_video" ? "Watch Video" : "Download File"}
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render link-based lesson
  const renderLinkLesson = () => {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <LinkIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mt-4 mb-2">{note.title}</h3>
          <p className="text-slate-600 mb-6">
            This lesson is an external resource. Click the link below to access it.
          </p>
          {note.external_url && (
            <Button
              size="lg"
              className="gap-2"
              asChild
            >
              <a href={note.external_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5" />
                Open External Link
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render structured content (AI-generated or manual rich text)
  const renderStructuredContent = () => {
    const sections = note.notes?.sections || [];

    if (sections.length === 0) {
      return (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed">
            No content available for this lesson.
          </p>
        </div>
      );
    }

    return (
      <div className="prose prose-slate max-w-none">
        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-slate-900 mt-6 mb-3 text-xl font-semibold">
              {section.title}
            </h3>
            <div
              className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(section.content) }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Determine which renderer to use
  const renderContent = () => {
    if (note.type === "link" && note.external_url) {
      return renderLinkLesson();
    }
    if ((note.type === "file_pdf" || note.type === "file_video" || note.type === "file_document") && note.file_url) {
      return renderFileLesson();
    }
    // AI-generated or manual rich text
    return renderStructuredContent();
  };

  return (
    <div className="min-h-screen bg-slate-50 -m-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Modules
            </Button>
            <Badge variant="outline" className="gap-1.5">
              <BookOpen className="w-3 h-3" />
              Note {currentNoteNumber} of {totalNotes}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Course Progress</span>
              <span className="text-slate-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <span>Course</span>
          <ChevronRight className="w-4 h-4" />
          <span>{module.title}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900">{note.title}</span>
        </div>

        {/* Note Content Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {/* Title Section */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-slate-900 mb-2">{note.title}</h1>
                  <div className="flex items-center gap-4 text-slate-600">
                    {note.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{note.duration}</span>
                      </div>
                    )}
                    {note.completed && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Type Badge */}
            {note.type && (
              <div className="mb-4">
                <Badge variant="outline" className="gap-1.5">
                  {getLessonTypeIcon()}
                  {getLessonTypeLabel()}
                </Badge>
              </div>
            )}

            {/* Main Content Area */}
            {renderContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="gap-2 min-w-[140px]"
            size="lg"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              {currentNoteNumber} of {totalNotes}
            </p>
          </div>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="gap-2 min-w-[140px] bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Completion Action */}
        {!note.completed && (
          <Card className="mt-6 bg-indigo-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                  <div>
                    <h4 className="text-slate-900 mb-1">Mark as Complete</h4>
                    <p className="text-sm text-slate-600">
                      Click to mark this note as completed and track your progress
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}