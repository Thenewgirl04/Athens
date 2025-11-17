import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle,
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
}: NoteDetailPageProps) {
  const progress = (currentNoteNumber / totalNotes) * 100;

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

              {/* Subtitle/Description */}
              <p className="text-slate-600">
                Learn essential concepts and practical applications in this lesson.
              </p>
            </div>

            {/* Main Content Area */}
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <h3 className="text-slate-900 mt-6 mb-3">Key Concepts</h3>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>

              <ul className="space-y-2 mb-4">
                <li className="text-slate-700">
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit
                </li>
                <li className="text-slate-700">
                  Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet
                </li>
                <li className="text-slate-700">
                  Consectetur, adipisci velit, sed quia non numquam eius modi tempora
                </li>
                <li className="text-slate-700">
                  Ut aliquid ex ea commodi consequatur quis autem vel eum iure
                </li>
              </ul>

              <h3 className="text-slate-900 mt-6 mb-3">Practical Applications</h3>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
              </p>

              <h3 className="text-slate-900 mt-6 mb-3">Summary</h3>
              
              <p className="text-slate-700 leading-relaxed mb-4">
                Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
              </p>
            </div>
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