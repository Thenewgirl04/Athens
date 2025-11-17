import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  Award,
  Sparkles,
  Video,
  Link as LinkIcon,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { NoteDetailPage } from './NoteDetailPage';

export interface Note {
  id: string;
  title: string;
  duration?: string;
  completed?: boolean;
  type?: string;
  file_url?: string;
  external_url?: string;
  notes?: {
    sections?: Array<{
      section_type: string;
      title: string;
      content: string;
    }>;
    estimated_duration?: string;
  };
}

export interface Quiz {
  id: number;
  title: string;
  totalQuestions: number;
  timeLimit?: number; // in minutes
  totalPoints: number;
  completed?: boolean;
  score?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  notes: Note[];
  quiz?: Quiz;
}

interface TopicWithLessons {
  topic_id: string;
  topic_title: string;
  topic_description?: string;
  week_number?: number;
  week_title?: string;
  lessons: Array<{
    id: string;
    title: string;
    type: string;
    created_at: string;
    file_url?: string;
    file_size?: string;
    external_url?: string;
    course_id: string;
    notes?: {
      sections?: Array<{
        section_type: string;
        title: string;
        content: string;
      }>;
      estimated_duration?: string;
    };
  }>;
}

interface ModulesTabProps {
  courseId: string;
  modules?: Module[]; // Keep for backward compatibility
}

export function ModulesTab({ courseId, modules: propModules }: ModulesTabProps) {
  const [modules, setModules] = useState<Module[]>(propModules || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<{
    note: Note;
    moduleIndex: number;
    noteIndex: number;
  } | null>(null);

  // Fetch lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = 'http://localhost:8000';
        const resp = await fetch(`${API_BASE_URL}/api/lessons/by-topic/${courseId}`);
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error(`Failed to fetch lessons: ${errorText.substring(0, 100)}`);
        }
        const data = await resp.json();
        
        // Convert API response to Module format
        const convertedModules: Module[] = (data.topics || []).map((topic: TopicWithLessons) => ({
          id: topic.topic_id,
          title: topic.week_title
            ? `Week ${topic.week_number}: ${topic.topic_title}`
            : topic.topic_title,
          description: topic.topic_description || "",
          notes: topic.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.notes?.estimated_duration,
            type: lesson.type,
            file_url: lesson.file_url,
            external_url: lesson.external_url,
            notes: lesson.notes,
            completed: false, // TODO: Track completion status
          })),
        }));
        
        setModules(convertedModules);
      } catch (err: any) {
        setError(err.message || "Error fetching lessons");
        // Fallback to prop modules if available
        if (propModules) {
          setModules(propModules);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId, propModules]);

  // Handle note selection
  const handleNoteClick = (note: Note, moduleIndex: number, noteIndex: number) => {
    setSelectedNote({ note, moduleIndex, noteIndex });
  };

  // Navigation functions
  const handleNext = () => {
    if (!selectedNote) return;

    const currentModule = modules[selectedNote.moduleIndex];
    const nextNoteIndex = selectedNote.noteIndex + 1;

    if (nextNoteIndex < currentModule.notes.length) {
      // Next note in same module
      setSelectedNote({
        note: currentModule.notes[nextNoteIndex],
        moduleIndex: selectedNote.moduleIndex,
        noteIndex: nextNoteIndex,
      });
    } else {
      // Try next module
      const nextModuleIndex = selectedNote.moduleIndex + 1;
      if (nextModuleIndex < modules.length && modules[nextModuleIndex].notes.length > 0) {
        setSelectedNote({
          note: modules[nextModuleIndex].notes[0],
          moduleIndex: nextModuleIndex,
          noteIndex: 0,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (!selectedNote) return;

    const prevNoteIndex = selectedNote.noteIndex - 1;

    if (prevNoteIndex >= 0) {
      // Previous note in same module
      const currentModule = modules[selectedNote.moduleIndex];
      setSelectedNote({
        note: currentModule.notes[prevNoteIndex],
        moduleIndex: selectedNote.moduleIndex,
        noteIndex: prevNoteIndex,
      });
    } else {
      // Try previous module
      const prevModuleIndex = selectedNote.moduleIndex - 1;
      if (prevModuleIndex >= 0) {
        const prevModule = modules[prevModuleIndex];
        if (prevModule.notes.length > 0) {
          setSelectedNote({
            note: prevModule.notes[prevModule.notes.length - 1],
            moduleIndex: prevModuleIndex,
            noteIndex: prevModule.notes.length - 1,
          });
        }
      }
    }
  };

  const canGoNext = () => {
    if (!selectedNote) return false;
    const currentModule = modules[selectedNote.moduleIndex];
    const isLastNoteInModule = selectedNote.noteIndex === currentModule.notes.length - 1;
    const isLastModule = selectedNote.moduleIndex === modules.length - 1;
    return !(isLastNoteInModule && isLastModule);
  };

  const canGoPrevious = () => {
    if (!selectedNote) return false;
    const isFirstNoteInModule = selectedNote.noteIndex === 0;
    const isFirstModule = selectedNote.moduleIndex === 0;
    return !(isFirstNoteInModule && isFirstModule);
  };

  // Calculate progress
  const getTotalNotes = () => {
    return modules.reduce((total, module) => total + module.notes.length, 0);
  };

  const getCurrentNoteNumber = () => {
    if (!selectedNote) return 0;
    let count = 0;
    for (let i = 0; i < selectedNote.moduleIndex; i++) {
      count += modules[i].notes.length;
    }
    count += selectedNote.noteIndex + 1;
    return count;
  };

  // If a note is selected, show the detail page
  if (selectedNote) {
    return (
      <NoteDetailPage
        note={selectedNote.note}
        module={modules[selectedNote.moduleIndex]}
        currentNoteNumber={getCurrentNoteNumber()}
        totalNotes={getTotalNotes()}
        onBack={() => setSelectedNote(null)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={canGoNext()}
        canGoPrevious={canGoPrevious()}
        courseId={courseId}
      />
    );
  }

  // Calculate module statistics
  const getModuleStats = (module: Module) => {
    const completed = module.notes.filter(note => note.completed).length;
    const total = module.notes.length;
    return { completed, total };
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "ai_generated":
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case "file_video":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "file_pdf":
        return <FileText className="w-4 h-4 text-red-600" />;
      case "link":
        return <LinkIcon className="w-4 h-4 text-blue-600" />;
      case "file_document":
      case "manual_rich_text":
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLessonTypeLabel = (type?: string) => {
    switch (type) {
      case "ai_generated":
        return "AI";
      case "file_video":
        return "Video";
      case "file_pdf":
        return "PDF";
      case "link":
        return "Link";
      case "file_document":
        return "Doc";
      case "manual_rich_text":
        return "Text";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-slate-900 mb-2">Course Modules</h3>
          <p className="text-slate-600">
            Explore the course content organized into modules. Click on any note to start learning.
          </p>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-slate-900 mb-2">Course Modules</h3>
          <p className="text-slate-600">
            Explore the course content organized into modules. Click on any note to start learning.
          </p>
        </div>
        <div className="p-8 text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-2">Course Modules</h3>
        <p className="text-slate-600">
          Explore the course content organized into modules. Click on any note to start learning.
        </p>
      </div>

      {/* Modules Accordion */}
      <Accordion type="single" collapsible className="space-y-4">
        {modules.map((module, moduleIndex) => {
          const stats = getModuleStats(module);
          const progress = Math.round((stats.completed / stats.total) * 100);

          return (
            <AccordionItem
              key={module.id}
              value={`module-${module.id}`}
              className="border border-slate-200 rounded-lg bg-white overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
                <div className="flex items-start justify-between w-full pr-4">
                  <div className="flex items-start gap-4 text-left">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-900 mb-1">
                        {module.title}
                      </h4>
                      {module.description && (
                        <p className="text-sm text-slate-600">{module.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-slate-500">
                          {stats.total} {stats.total === 1 ? 'lesson' : 'lessons'}
                        </span>
                        {stats.completed > 0 && (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                            {progress}% Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-2 pt-2">
                  {module.notes.map((note, noteIndex) => (
                    <button
                      key={note.id}
                      onClick={() => handleNoteClick(note, moduleIndex, noteIndex)}
                      className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {note.completed ? (
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                              {getLessonIcon(note.type)}
                            </div>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {note.title}
                            </p>
                            {note.type && (
                              <Badge variant="outline" className="text-xs">
                                {getLessonTypeLabel(note.type)}
                              </Badge>
                            )}
                          </div>
                          {note.duration && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {note.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      {note.external_url || note.file_url ? (
                        <div className="flex gap-2">
                          {note.external_url && (
                            <a
                              href={note.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-indigo-100 rounded"
                            >
                              <LinkIcon className="w-4 h-4 text-blue-600" />
                            </a>
                          )}
                          {note.file_url && (
                            <a
                              href={`http://localhost:8000/api/lessons/file/${courseId}/${note.id}/${note.file_url.split("/").pop()}`}
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-indigo-100 rounded"
                            >
                              <Download className="w-4 h-4 text-purple-600" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  
                  {/* Quiz Box */}
                  {module.quiz && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="w-full flex items-center justify-between p-4 border-2 border-amber-200 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 hover:border-amber-300 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {module.quiz.completed ? (
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <Award className="w-5 h-5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                <HelpCircle className="w-5 h-5 text-amber-600" />
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-slate-900 font-semibold group-hover:text-amber-700 transition-colors">
                                {module.quiz.title}
                              </p>
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-100">
                                Quiz
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                {module.quiz.totalQuestions} questions
                              </span>
                              {module.quiz.timeLimit && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {module.quiz.timeLimit} min
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {module.quiz.totalPoints} points
                              </span>
                              {module.quiz.completed && module.quiz.score !== undefined && (
                                <Badge className="bg-emerald-500 text-white text-xs">
                                  Score: {module.quiz.score}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.quiz.completed ? (
                            <Badge className="bg-emerald-500 text-white">
                              Completed
                            </Badge>
                          ) : (
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                              Start Quiz
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Empty State */}
      {modules.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 mb-2">No modules available</h3>
          <p className="text-slate-500">
            Course modules will appear here once the instructor adds them.
          </p>
        </div>
      )}
    </div>
  );
}
