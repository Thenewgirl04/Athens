import React, { useState } from 'react';
import {
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  Award,
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
  id: number;
  title: string;
  duration?: string;
  completed?: boolean;
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
  id: number;
  title: string;
  description: string;
  notes: Note[];
  quiz?: Quiz;
}

interface ModulesTabProps {
  modules: Module[];
}

export function ModulesTab({ modules }: ModulesTabProps) {
  const [selectedNote, setSelectedNote] = useState<{
    note: Note;
    moduleIndex: number;
    noteIndex: number;
  } | null>(null);

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
      />
    );
  }

  // Calculate module statistics
  const getModuleStats = (module: Module) => {
    const completed = module.notes.filter(note => note.completed).length;
    const total = module.notes.length;
    return { completed, total };
  };

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
                        Module {moduleIndex + 1}: {module.title}
                      </h4>
                      <p className="text-sm text-slate-600">{module.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-slate-500">
                          {stats.total} {stats.total === 1 ? 'note' : 'notes'}
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
                              <FileText className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {note.title}
                          </p>
                          {note.duration && (
                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {note.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
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
