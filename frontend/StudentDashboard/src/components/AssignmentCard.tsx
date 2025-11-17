import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';

export interface Assignment {
  id: number;
  title: string;
  courseName: string;
  dueDate: string | null;
  points: number;
  status: 'not-submitted' | 'missing' | 'submitted' | 'graded' | 'overdue' | 'upcoming';
  score?: number;
  category: 'overdue' | 'upcoming' | 'undated';
}

interface AssignmentCardProps {
  assignment: Assignment;
  onClick: () => void;
}

const statusConfig = {
  'not-submitted': { label: 'Not Submitted', variant: 'secondary' as const, className: 'bg-slate-100 text-slate-700' },
  'missing': { label: 'Missing', variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
  'submitted': { label: 'Submitted', variant: 'default' as const, className: 'bg-blue-100 text-blue-700' },
  'graded': { label: 'Graded', variant: 'default' as const, className: 'bg-emerald-100 text-emerald-700' },
  'overdue': { label: 'Overdue', variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
  'upcoming': { label: 'Upcoming', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-700' },
};

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const statusInfo = statusConfig[assignment.status];

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-slate-900 mb-1">{assignment.title}</h4>
          <p className="text-sm text-slate-500 mb-3">{assignment.courseName}</p>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">
                {assignment.dueDate ? `Due ${assignment.dueDate}` : 'No due date'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-900">{assignment.points} pts</span>
            </div>
          </div>
          
          <div className="mt-3">
            <Badge className={statusInfo.className}>
              {statusInfo.label}
              {assignment.status === 'graded' && assignment.score !== undefined && (
                <span className="ml-1">({assignment.score}/{assignment.points})</span>
              )}
            </Badge>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </div>
    </div>
  );
}
