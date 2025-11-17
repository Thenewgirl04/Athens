import React from 'react';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, AlertCircle, Target, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface TopicPerformance {
  topicId: string;
  topicTitle: string;
  questionsCount: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  performanceLevel: 'strong' | 'moderate' | 'weak';
}

interface QuizAnalysis {
  overallScore: number;
  maxScore: number;
  percentage: number;
  performanceLevel: 'fail' | 'below_moderate' | 'moderate_plus';
  topicBreakdown: TopicPerformance[];
  correctCount: number;
  incorrectCount: number;
}

interface QuizAnalysisPageProps {
  analysis: QuizAnalysis;
  quizType: 'main' | 'refresher' | 'dynamic';
  weekNumber: number;
  onBack: () => void;
  showDynamicQuizMessage?: boolean;
}

export function QuizAnalysisPage({
  analysis,
  quizType,
  weekNumber,
  onBack,
  showDynamicQuizMessage = false
}: QuizAnalysisPageProps) {
  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'strong':
      case 'moderate_plus':
        return 'text-emerald-600';
      case 'moderate':
      case 'below_moderate':
        return 'text-amber-600';
      case 'weak':
      case 'fail':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getPerformanceBgColor = (level: string) => {
    switch (level) {
      case 'strong':
      case 'moderate_plus':
        return 'bg-emerald-50 border-emerald-200';
      case 'moderate':
      case 'below_moderate':
        return 'bg-amber-50 border-amber-200';
      case 'weak':
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPerformanceLabel = (level: string) => {
    switch (level) {
      case 'strong':
        return 'Strong';
      case 'moderate':
        return 'Moderate';
      case 'weak':
        return 'Weak';
      case 'moderate_plus':
        return 'Excellent';
      case 'below_moderate':
        return 'Needs Improvement';
      case 'fail':
        return 'Failed';
      default:
        return level;
    }
  };

  const getPerformanceMessage = (percentage: number, level: string) => {
    if (level === 'fail') {
      return 'You need to complete the Dynamic Quiz to proceed.';
    }
    if (percentage >= 85) {
      return 'Excellent work! Keep up the great performance.';
    }
    if (percentage >= 60) {
      return 'Good job! Consider reviewing weak areas.';
    }
    return 'Focus on improving weak areas.';
  };

  return (
    <div className="bg-slate-50 relative">
      {/* Sticky Header with Close Button */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Quiz Analysis - Week {weekNumber}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {quizType === 'main' && 'Main Quiz Results'}
              {quizType === 'refresher' && 'Refresher Quiz Results'}
              {quizType === 'dynamic' && 'Dynamic Quiz Results'}
            </p>
          </div>
          <div className="flex gap-3 ml-4">
            <Button 
              onClick={onBack} 
              variant="outline"
              className="px-6 py-2 text-base font-medium"
            >
              Close
            </Button>
            <button
              onClick={onBack}
              className="p-3 rounded-lg hover:bg-slate-100 transition-colors border-2 border-slate-300 bg-white shadow-sm"
              aria-label="Close"
              title="Close"
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">

        {/* Overall Score Card */}
        <Card className={`border-2 ${getPerformanceBgColor(analysis.performanceLevel)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Performance</span>
              <Badge className={getPerformanceColor(analysis.performanceLevel)}>
                {getPerformanceLabel(analysis.performanceLevel)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${getPerformanceColor(analysis.performanceLevel)}`}>
                {analysis.percentage.toFixed(1)}%
              </div>
              <p className="text-slate-600 mb-4">
                {analysis.correctCount} out of {analysis.maxScore} questions correct
              </p>
              <Progress value={analysis.percentage} className="h-3 mb-4" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Correct</p>
                <p className="text-2xl font-semibold text-emerald-600">
                  {analysis.correctCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Incorrect</p>
                <p className="text-2xl font-semibold text-red-600">
                  {analysis.incorrectCount}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {analysis.maxScore}
                </p>
              </div>
            </div>

            {showDynamicQuizMessage && analysis.percentage < 60 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dynamic Quiz Required:</strong> You scored below 60%. 
                  You must complete the Dynamic Quiz to unlock next week's content.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Topic Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Topic Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.topicBreakdown.map((topic) => (
                <div
                  key={topic.topicId}
                  className={`p-4 rounded-lg border ${getPerformanceBgColor(topic.performanceLevel)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {topic.topicTitle}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {topic.correctCount} correct, {topic.incorrectCount} incorrect
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPerformanceColor(topic.performanceLevel)}>
                        {getPerformanceLabel(topic.performanceLevel)}
                      </Badge>
                      <p className={`text-2xl font-bold mt-1 ${getPerformanceColor(topic.performanceLevel)}`}>
                        {topic.percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={topic.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              {getPerformanceMessage(analysis.percentage, analysis.performanceLevel)}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">
                  {analysis.topicBreakdown.filter(t => t.performanceLevel === 'strong').length} Strong Areas
                </span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">
                  {analysis.topicBreakdown.filter(t => t.performanceLevel === 'weak').length} Weak Areas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Close Button */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 shadow-lg -mx-6 -mb-6">
          <div className="max-w-4xl mx-auto flex justify-end">
            <Button 
              onClick={onBack} 
              className="px-8 py-3 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              Close & Return to Course
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

