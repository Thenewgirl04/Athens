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

interface WeekGroup {
  week_number: number;
  week_title: string;
  topics: Array<{
    topic_id: string;
    topic_title: string;
    topic_description?: string;
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
  }>;
}

interface ModulesTabProps {
  courseId: string;
  modules?: Module[]; // Keep for backward compatibility
}

export function ModulesTab({ courseId, modules: propModules }: ModulesTabProps) {
  const [modules, setModules] = useState<Module[]>(propModules || []);
  const [weekGroups, setWeekGroups] = useState<WeekGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<{
    note: Note;
    weekNumber: number;
    topicIndex: number;
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
        
        // Group topics by week
        const weekMap = new Map<number, WeekGroup>();
        
        (data.topics || []).forEach((topic: TopicWithLessons) => {
          const weekNum = topic.week_number || 0;
          const weekTitle = topic.week_title || `Week ${weekNum}`;
          
          if (!weekMap.has(weekNum)) {
            weekMap.set(weekNum, {
              week_number: weekNum,
              week_title: weekTitle,
              topics: [],
            });
          }
          
          const weekGroup = weekMap.get(weekNum)!;
          weekGroup.topics.push({
            topic_id: topic.topic_id,
            topic_title: topic.topic_title,
            topic_description: topic.topic_description,
            lessons: topic.lessons,
          });
        });
        
        // Convert to array and sort by week number
        const groupedWeeks = Array.from(weekMap.values()).sort((a, b) => a.week_number - b.week_number);
        setWeekGroups(groupedWeeks);
        
        // Also keep backward compatibility with modules format
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

  // Navigation functions
  const handleNext = () => {
    if (!selectedNote) return;

    const week = weekGroups.find(w => w.week_number === selectedNote.weekNumber);
    if (!week) return;

    const currentTopic = week.topics[selectedNote.topicIndex];
    const nextNoteIndex = selectedNote.noteIndex + 1;

    if (nextNoteIndex < currentTopic.lessons.length) {
      // Next note in same topic
      const lesson = currentTopic.lessons[nextNoteIndex];
      const note: Note = {
        id: lesson.id,
        title: lesson.title,
        duration: lesson.notes?.estimated_duration,
        type: lesson.type,
        file_url: lesson.file_url,
        external_url: lesson.external_url,
        notes: lesson.notes,
        completed: false,
      };
      setSelectedNote({
        note,
        weekNumber: selectedNote.weekNumber,
        topicIndex: selectedNote.topicIndex,
        noteIndex: nextNoteIndex,
      });
    } else {
      // Try next topic in same week
      const nextTopicIndex = selectedNote.topicIndex + 1;
      if (nextTopicIndex < week.topics.length && week.topics[nextTopicIndex].lessons.length > 0) {
        const lesson = week.topics[nextTopicIndex].lessons[0];
        const note: Note = {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.notes?.estimated_duration,
          type: lesson.type,
          file_url: lesson.file_url,
          external_url: lesson.external_url,
          notes: lesson.notes,
          completed: false,
        };
        setSelectedNote({
          note,
          weekNumber: selectedNote.weekNumber,
          topicIndex: nextTopicIndex,
          noteIndex: 0,
        });
      } else {
        // Try next week
        const currentWeekIndex = weekGroups.findIndex(w => w.week_number === selectedNote.weekNumber);
        if (currentWeekIndex < weekGroups.length - 1) {
          const nextWeek = weekGroups[currentWeekIndex + 1];
          if (nextWeek.topics.length > 0 && nextWeek.topics[0].lessons.length > 0) {
            const lesson = nextWeek.topics[0].lessons[0];
            const note: Note = {
              id: lesson.id,
              title: lesson.title,
              duration: lesson.notes?.estimated_duration,
              type: lesson.type,
              file_url: lesson.file_url,
              external_url: lesson.external_url,
              notes: lesson.notes,
              completed: false,
            };
            setSelectedNote({
              note,
              weekNumber: nextWeek.week_number,
              topicIndex: 0,
              noteIndex: 0,
            });
          }
        }
      }
    }
  };

  const handlePrevious = () => {
    if (!selectedNote) return;

    const week = weekGroups.find(w => w.week_number === selectedNote.weekNumber);
    if (!week) return;

    const prevNoteIndex = selectedNote.noteIndex - 1;

    if (prevNoteIndex >= 0) {
      // Previous note in same topic
      const currentTopic = week.topics[selectedNote.topicIndex];
      const lesson = currentTopic.lessons[prevNoteIndex];
      const note: Note = {
        id: lesson.id,
        title: lesson.title,
        duration: lesson.notes?.estimated_duration,
        type: lesson.type,
        file_url: lesson.file_url,
        external_url: lesson.external_url,
        notes: lesson.notes,
        completed: false,
      };
      setSelectedNote({
        note,
        weekNumber: selectedNote.weekNumber,
        topicIndex: selectedNote.topicIndex,
        noteIndex: prevNoteIndex,
      });
    } else {
      // Try previous topic in same week
      const prevTopicIndex = selectedNote.topicIndex - 1;
      if (prevTopicIndex >= 0) {
        const prevTopic = week.topics[prevTopicIndex];
        if (prevTopic.lessons.length > 0) {
          const lesson = prevTopic.lessons[prevTopic.lessons.length - 1];
          const note: Note = {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.notes?.estimated_duration,
            type: lesson.type,
            file_url: lesson.file_url,
            external_url: lesson.external_url,
            notes: lesson.notes,
            completed: false,
          };
          setSelectedNote({
            note,
            weekNumber: selectedNote.weekNumber,
            topicIndex: prevTopicIndex,
            noteIndex: prevTopic.lessons.length - 1,
          });
        }
      } else {
        // Try previous week
        const currentWeekIndex = weekGroups.findIndex(w => w.week_number === selectedNote.weekNumber);
        if (currentWeekIndex > 0) {
          const prevWeek = weekGroups[currentWeekIndex - 1];
          if (prevWeek.topics.length > 0) {
            const lastTopic = prevWeek.topics[prevWeek.topics.length - 1];
            if (lastTopic.lessons.length > 0) {
              const lesson = lastTopic.lessons[lastTopic.lessons.length - 1];
              const note: Note = {
                id: lesson.id,
                title: lesson.title,
                duration: lesson.notes?.estimated_duration,
                type: lesson.type,
                file_url: lesson.file_url,
                external_url: lesson.external_url,
                notes: lesson.notes,
                completed: false,
              };
              setSelectedNote({
                note,
                weekNumber: prevWeek.week_number,
                topicIndex: prevWeek.topics.length - 1,
                noteIndex: lastTopic.lessons.length - 1,
              });
            }
          }
        }
      }
    }
  };

  const canGoNext = () => {
    if (!selectedNote) return false;
    const week = weekGroups.find(w => w.week_number === selectedNote.weekNumber);
    if (!week) return false;
    
    const currentTopic = week.topics[selectedNote.topicIndex];
    const isLastNoteInTopic = selectedNote.noteIndex === currentTopic.lessons.length - 1;
    const isLastTopicInWeek = selectedNote.topicIndex === week.topics.length - 1;
    const currentWeekIndex = weekGroups.findIndex(w => w.week_number === selectedNote.weekNumber);
    const isLastWeek = currentWeekIndex === weekGroups.length - 1;
    
    return !(isLastNoteInTopic && isLastTopicInWeek && isLastWeek);
  };

  const canGoPrevious = () => {
    if (!selectedNote) return false;
    const isFirstNoteInTopic = selectedNote.noteIndex === 0;
    const isFirstTopicInWeek = selectedNote.topicIndex === 0;
    const currentWeekIndex = weekGroups.findIndex(w => w.week_number === selectedNote.weekNumber);
    const isFirstWeek = currentWeekIndex === 0;
    
    return !(isFirstNoteInTopic && isFirstTopicInWeek && isFirstWeek);
  };

  // Calculate progress
  const getTotalNotes = () => {
    return weekGroups.reduce((total, week) => 
      total + week.topics.reduce((topicTotal, topic) => topicTotal + topic.lessons.length, 0), 0
    );
  };

  const getCurrentNoteNumber = () => {
    if (!selectedNote) return 0;
    let count = 0;
    
    const currentWeekIndex = weekGroups.findIndex(w => w.week_number === selectedNote.weekNumber);
    
    // Count all lessons in previous weeks
    for (let i = 0; i < currentWeekIndex; i++) {
      count += weekGroups[i].topics.reduce((total, topic) => total + topic.lessons.length, 0);
    }
    
    // Count lessons in previous topics of current week
    const currentWeek = weekGroups[currentWeekIndex];
    for (let i = 0; i < selectedNote.topicIndex; i++) {
      count += currentWeek.topics[i].lessons.length;
    }
    
    // Add current note index
    count += selectedNote.noteIndex + 1;
    
    return count;
  };

  // If a note is selected, show the detail page
  if (selectedNote) {
    // Find the module for backward compatibility
    const module = modules.find(m => 
      m.notes.some(n => n.id === selectedNote.note.id)
    ) || modules[0];
    
    return (
      <NoteDetailPage
        note={selectedNote.note}
        module={module}
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

  // Calculate total lessons across all weeks
  const getTotalLessonsForWeek = (week: WeekGroup) => {
    return week.topics.reduce((total, topic) => total + topic.lessons.length, 0);
  };

  const handleNoteClick = (note: Note, weekNumber: number, topicIndex: number, noteIndex: number) => {
    setSelectedNote({ note, weekNumber, topicIndex, noteIndex });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-slate-900 mb-2">Course Modules</h3>
        <p className="text-slate-600">
          Explore the course content organized by weeks. Click on any lesson to start learning.
        </p>
      </div>

      {/* Weeks Accordion */}
      <Accordion type="single" collapsible className="space-y-4">
        {weekGroups.map((week) => {
          const totalLessons = getTotalLessonsForWeek(week);

          return (
            <AccordionItem
              key={`week-${week.week_number}`}
              value={`week-${week.week_number}`}
              className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline">
                <div className="flex items-start gap-4 w-full text-left">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0 font-bold text-lg">
                    {week.week_number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-900 font-semibold mb-1">
                      {week.week_title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {week.topics.length} {week.topics.length === 1 ? 'topic' : 'topics'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-16 space-y-6">
                  {week.topics.map((topic, topicIndex) => (
                    <div key={topic.topic_id} className="space-y-3">
                      {/* Topic Header */}
                      <div className="mb-3">
                        <h5 className="text-slate-900 font-semibold mb-1">{topic.topic_title}</h5>
                        {topic.topic_description && (
                          <p className="text-sm text-slate-600">{topic.topic_description}</p>
                        )}
                      </div>
                      
                      {/* Lessons */}
                      <div className="space-y-2">
                        {topic.lessons.map((lesson, noteIndex) => {
                          const note: Note = {
                            id: lesson.id,
                            title: lesson.title,
                            duration: lesson.notes?.estimated_duration,
                            type: lesson.type,
                            file_url: lesson.file_url,
                            external_url: lesson.external_url,
                            notes: lesson.notes,
                            completed: false,
                          };

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleNoteClick(note, week.week_number, topicIndex, noteIndex)}
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Empty State */}
      {weekGroups.length === 0 && (
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
