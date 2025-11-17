import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Plus, Clock, FileText, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import type { Assignment } from './AssignmentCard';

interface AssignmentDetailsProps {
  assignment: Assignment;
  onBack: () => void;
  onStartQuiz?: () => void;
  onViewSubmission?: () => void;
}

export function AssignmentDetails({ assignment, onBack, onStartQuiz, onViewSubmission }: AssignmentDetailsProps) {
  const [reminders, setReminders] = useState<string[]>([]);

  const getActionButton = () => {
    switch (assignment.status) {
      case 'not-submitted':
      case 'overdue':
      case 'missing':
        return { text: 'Submit Assignment', variant: 'default' as const, icon: FileText };
      case 'submitted':
        return { text: 'View Submission', variant: 'secondary' as const, icon: CheckCircle };
      case 'graded':
        return { text: 'View Results', variant: 'default' as const, icon: CheckCircle };
      default:
        return { text: 'Take Quiz', variant: 'default' as const, icon: FileText };
    }
  };

  const actionButton = getActionButton();
  const ActionIcon = actionButton.icon;

  const statusConfig = {
    'not-submitted': { label: 'Not Submitted', color: 'text-slate-600' },
    'missing': { label: 'Missing', color: 'text-red-600' },
    'submitted': { label: 'Submitted - Pending Grade', color: 'text-blue-600' },
    'graded': { label: 'Graded', color: 'text-emerald-600' },
    'overdue': { label: 'Overdue', color: 'text-red-600' },
    'upcoming': { label: 'Not Started', color: 'text-slate-600' },
  };

  const statusInfo = statusConfig[assignment.status];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-slate-900">Assignment Details</h2>
              <p className="text-sm text-slate-500">{assignment.courseName}</p>
            </div>
          </div>
        </header>

        {/* Assignment Details Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Assignment Title Block */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-slate-900 mb-2">{assignment.title}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-slate-900">{assignment.points} pts</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className={statusInfo.color}>
                        {statusInfo.label}
                        {assignment.status === 'graded' && assignment.score !== undefined && (
                          <span className="ml-2">
                            {assignment.score}/{assignment.points} pts
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Submission & Rubric Button */}
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {}}
                  >
                    <span>Submission & Rubric</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings Block */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-4">Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Questions</span>
                    <span className="text-slate-900">25</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Time Limit</span>
                    <span className="text-slate-900">None</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Allowed Attempts</span>
                    <span className="text-slate-900">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Due Block */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-3">Due</h3>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-900">
                    {assignment.dueDate ? `Due ${assignment.dueDate}` : 'No due date set'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Reminder Block */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-900 mb-2">Reminders</h3>
                    <p className="text-sm text-slate-600">
                      Add due date reminder notifications about this assignment on this device.
                    </p>
                  </div>
                  
                  {reminders.length > 0 && (
                    <div className="space-y-2">
                      {reminders.map((reminder, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-slate-50 rounded-md"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-slate-700">{reminder}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setReminders([...reminders, '1 day before due date']);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Submission Type Block */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-slate-900 mb-3">Submission Type</h3>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-900">Online Quiz</span>
                </div>
              </CardContent>
            </Card>

            {/* Spacer for bottom button */}
            <div className="h-20"></div>
          </div>
        </main>

        {/* Bottom Action Button */}
        <div className="bg-white border-t border-slate-200 p-6">
          <div className="max-w-4xl mx-auto">
            <Button 
              className="w-full gap-2" 
              size="lg" 
              variant={actionButton.variant}
              onClick={() => {
                if (assignment.status === 'not-submitted' || assignment.status === 'overdue' || assignment.status === 'missing') {
                  onStartQuiz?.();
                } else if (assignment.status === 'submitted' || assignment.status === 'graded') {
                  onViewSubmission?.();
                }
              }}
            >
              <ActionIcon className="w-5 h-5" />
              {actionButton.text}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}