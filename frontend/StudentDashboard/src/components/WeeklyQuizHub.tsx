import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Target, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface QuizAvailability {
  weekNumber: number;
  mainQuizAvailable: boolean;
  mainQuizCompleted: boolean;
  mainQuizScore: number | null;
  refresherQuizAvailable: boolean;
  dynamicQuizAvailable: boolean;
  dynamicQuizRequired: boolean;
  dynamicQuizCompleted: boolean;
}

interface WeeklyQuizHubProps {
  courseId: string;
  weekNumber: number;
  studentId: string;
  onStartQuiz: (quizType: 'main' | 'refresher' | 'dynamic') => void;
}

export function WeeklyQuizHub({ courseId, weekNumber, studentId, onStartQuiz }: WeeklyQuizHubProps) {
  const [availability, setAvailability] = useState<QuizAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizAvailability();
  }, [courseId, weekNumber, studentId]);

  const fetchQuizAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/quiz/availability/${studentId}/${courseId}/${weekNumber}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch quiz availability');
      }
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz availability');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizType: 'main' | 'refresher' | 'dynamic') => {
    try {
      setError(null);
      // For refresher quiz, generate a new one each time
      if (quizType === 'refresher') {
        const response = await fetch(
          `http://localhost:8000/api/quiz/generate-refresher/${courseId}/${weekNumber}`,
          { method: 'POST' }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to generate refresher quiz' }));
          throw new Error(errorData.detail || 'Failed to generate refresher quiz');
        }
      }
      // For dynamic quiz, generate if not exists
      else if (quizType === 'dynamic') {
        const response = await fetch(
          `http://localhost:8000/api/quiz/generate-dynamic/${courseId}/${weekNumber}/${studentId}`,
          { method: 'POST' }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to generate dynamic quiz' }));
          throw new Error(errorData.detail || 'Failed to generate dynamic quiz');
        }
      }
      
      onStartQuiz(quizType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start quiz';
      setError(errorMessage);
      console.error('Quiz generation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-600">Loading quiz availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!availability) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Week {weekNumber} Quizzes</h2>
        <p className="text-slate-600">Choose a quiz type to begin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Quiz */}
        <Card className={availability.mainQuizCompleted ? 'opacity-75' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Main Quiz
              </CardTitle>
              {availability.mainQuizCompleted && (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <CardDescription>
              Mandatory quiz covering this week's topics with bonus questions from previous week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availability.mainQuizCompleted ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-lg font-semibold text-slate-900">
                  Score: {availability.mainQuizScore?.toFixed(1)}%
                </p>
                <Badge variant="secondary" className="w-full justify-center">
                  One attempt only
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Available</p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>8 questions on current week</li>
                  <li>1-2 bonus questions</li>
                  <li>Contributes to grade</li>
                  <li>One attempt only</li>
                </ul>
                <Button
                  onClick={() => handleStartQuiz('main')}
                  className="w-full"
                  disabled={!availability.mainQuizAvailable}
                >
                  Start Main Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refresher Quiz */}
        <Card className={!availability.refresherQuizAvailable ? 'opacity-50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                Refresher Quiz
              </CardTitle>
            </div>
            <CardDescription>
              Optional practice quiz - questions change each time you take it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!availability.refresherQuizAvailable ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Locked</p>
                <p className="text-xs text-slate-500">
                  Complete the main quiz first
                </p>
                <Button className="w-full" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Available</p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>10 questions on week's topics</li>
                  <li>Unlimited attempts</li>
                  <li>Doesn't affect grade</li>
                  <li>New questions each time</li>
                </ul>
                <Button
                  onClick={() => handleStartQuiz('refresher')}
                  className="w-full"
                  variant="outline"
                >
                  Start Refresher Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Quiz */}
        <Card className={!availability.dynamicQuizAvailable ? 'opacity-50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Dynamic Quiz
              </CardTitle>
              {availability.dynamicQuizRequired && (
                <Badge variant="destructive">Required</Badge>
              )}
            </div>
            <CardDescription>
              Personalized quiz targeting your weak areas (only if you failed main quiz)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!availability.dynamicQuizAvailable ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Not Available</p>
                <p className="text-xs text-slate-500">
                  {availability.mainQuizCompleted && availability.mainQuizScore !== null && availability.mainQuizScore >= 60
                    ? "You passed the main quiz! No dynamic quiz needed."
                    : "Complete the main quiz first. Dynamic quiz appears if you score below 60%."}
                </p>
                <Button className="w-full" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Not Available
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {availability.dynamicQuizRequired && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Required to unlock next week's content
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-slate-600">
                  {availability.dynamicQuizCompleted ? 'Completed' : 'Available'}
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>10 questions on weak areas</li>
                  <li>Targets your mistakes</li>
                  <li>Required if main quiz failed</li>
                  <li>Must complete to proceed</li>
                </ul>
                <Button
                  onClick={() => handleStartQuiz('dynamic')}
                  className="w-full"
                  variant={availability.dynamicQuizRequired ? 'default' : 'outline'}
                >
                  {availability.dynamicQuizCompleted ? 'Retake Dynamic Quiz' : 'Start Dynamic Quiz'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

