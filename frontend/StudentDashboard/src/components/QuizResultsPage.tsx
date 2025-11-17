import React from 'react';
import {
  CheckCircle,
  Clock,
  Trophy,
  Calendar,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface QuizResult {
  score: number;
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  submissionTime: string;
  attemptNumber: number;
  status: 'graded' | 'auto-graded';
  quizTitle: string;
}

interface QuizResultsPageProps {
  result: QuizResult;
  onViewSubmission: () => void;
  onBackToAssignments: () => void;
}

export function QuizResultsPage({ result, onViewSubmission, onBackToAssignments }: QuizResultsPageProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-50 border-emerald-200';
    if (percentage >= 80) return 'bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent work! 🎉';
    if (percentage >= 80) return 'Great job! 👏';
    if (percentage >= 70) return 'Good effort! 👍';
    if (percentage >= 60) return 'You passed! ✓';
    return 'Keep practicing! 💪';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-slate-900 mb-2">Quiz Submitted Successfully!</h1>
          <p className="text-slate-600">Your quiz has been graded automatically</p>
        </div>

        {/* Score Card */}
        <Card className={`mb-6 border-2 ${getScoreBgColor(result.percentage)}`}>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className={`w-6 h-6 ${getScoreColor(result.percentage)}`} />
                <h2 className={`${getScoreColor(result.percentage)}`}>
                  {getPerformanceMessage(result.percentage)}
                </h2>
              </div>
              <div className={`text-6xl mb-2 ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </div>
              <p className="text-slate-600">
                {result.score} out of {result.totalQuestions} questions correct
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Score</p>
                <p className={`text-2xl ${getScoreColor(result.percentage)}`}>
                  {result.earnedPoints}/{result.totalPoints}
                </p>
                <p className="text-sm text-slate-500">points</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Grade</p>
                <p className={`text-2xl ${getScoreColor(result.percentage)}`}>
                  {result.percentage >= 90 ? 'A' :
                   result.percentage >= 80 ? 'B' :
                   result.percentage >= 70 ? 'C' :
                   result.percentage >= 60 ? 'D' : 'F'}
                </p>
                <p className="text-sm text-slate-500">letter grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-slate-900 mb-4">Submission Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Quiz</p>
                  <p className="text-slate-900">{result.quizTitle}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Submitted</p>
                  <p className="text-slate-900">{result.submissionTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Hash className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Attempt</p>
                  <p className="text-slate-900">Attempt #{result.attemptNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900">
                      {result.status === 'auto-graded' ? 'Auto-graded' : 'Graded'}
                    </p>
                    <Badge variant={result.status === 'auto-graded' ? 'default' : 'secondary'}>
                      Complete
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBackToAssignments}
            className="flex-1"
          >
            Back to Assignments
          </Button>
          <Button
            onClick={onViewSubmission}
            className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            View Detailed Feedback
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
