import React from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { QuizQuestion } from './QuizTakingPage';

export interface QuizFeedbackData {
  quizTitle: string;
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
  score: number;
  totalQuestions: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
}

interface QuizFeedbackPageProps {
  feedbackData: QuizFeedbackData;
  onBackToAssignments: () => void;
}

export function QuizFeedbackPage({ feedbackData, onBackToAssignments }: QuizFeedbackPageProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const isCorrect = (questionId: number, correctAnswer: number) => {
    const userAnswer = feedbackData.userAnswers[questionId];
    return userAnswer === correctAnswer;
  };

  const correctCount = feedbackData.questions.filter(q => 
    isCorrect(q.id, q.correctAnswer)
  ).length;

  const incorrectCount = feedbackData.totalQuestions - correctCount;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToAssignments}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-slate-900 mb-2">Quiz Feedback</h1>
              <p className="text-slate-600">{feedbackData.quizTitle}</p>
            </div>
          </div>
        </div>

        {/* Score Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Trophy className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className={`text-3xl mb-1 ${getScoreColor(feedbackData.percentage)}`}>
                    {feedbackData.percentage}%
                  </h3>
                  <p className="text-slate-600">
                    {feedbackData.earnedPoints} / {feedbackData.totalPoints} points
                  </p>
                </div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl text-emerald-600">{correctCount}</span>
                  </div>
                  <p className="text-sm text-slate-600">Correct</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-2xl text-red-600">{incorrectCount}</span>
                  </div>
                  <p className="text-sm text-slate-600">Incorrect</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-6">
          <h3 className="text-slate-900">Question Review</h3>
          
          {feedbackData.questions.map((question, index) => {
            const userAnswerIndex = feedbackData.userAnswers[question.id];
            const correct = isCorrect(question.id, question.correctAnswer);
            const wasAnswered = userAnswerIndex !== undefined;

            return (
              <Card 
                key={question.id}
                className={`border-2 ${
                  correct 
                    ? 'border-emerald-200 bg-emerald-50/30' 
                    : 'border-red-200 bg-red-50/30'
                }`}
              >
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                        correct 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-900 mb-2">
                          Question {index + 1}
                        </h4>
                        <p className="text-slate-700">{question.questionText}</p>
                      </div>
                    </div>
                    {correct ? (
                      <Badge className="bg-emerald-600 gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1.5">
                        <XCircle className="w-3 h-3" />
                        Incorrect
                      </Badge>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isUserAnswer = userAnswerIndex === optionIndex;
                      const isCorrectAnswer = question.correctAnswer === optionIndex;
                      
                      return (
                        <div
                          key={optionIndex}
                          className={`p-4 border rounded-lg ${
                            isCorrectAnswer
                              ? 'border-emerald-600 bg-emerald-50'
                              : isUserAnswer && !correct
                              ? 'border-red-600 bg-red-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCorrectAnswer && (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              )}
                              {isUserAnswer && !correct && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              {!isCorrectAnswer && !isUserAnswer && (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900">{option}</p>
                              {isCorrectAnswer && (
                                <p className="text-sm text-emerald-600 mt-1">
                                  ✓ Correct Answer
                                </p>
                              )}
                              {isUserAnswer && !correct && (
                                <p className="text-sm text-red-600 mt-1">
                                  ✗ Your Answer
                                </p>
                              )}
                              {isUserAnswer && correct && (
                                <p className="text-sm text-emerald-600 mt-1">
                                  ✓ Your Answer
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Not Answered Warning */}
                  {!wasAnswered && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-900">This question was not answered</p>
                        <p className="text-sm text-amber-700">
                          The correct answer is: {question.options[question.correctAnswer]}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Summary */}
        <Card className="mt-6 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-slate-900 mb-1">Final Score</h3>
                <p className="text-slate-600">
                  {feedbackData.score} out of {feedbackData.totalQuestions} questions correct
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl mb-1 ${getScoreColor(feedbackData.percentage)}`}>
                  {feedbackData.percentage}%
                </div>
                <p className="text-slate-600">
                  {feedbackData.earnedPoints} / {feedbackData.totalPoints} points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={onBackToAssignments}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Return to Assignments
        </Button>
      </div>
    </div>
  );
}
