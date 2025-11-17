import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export interface QuizQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  totalPoints: number;
}

interface QuizTakingPageProps {
  quiz: QuizData;
  onSubmit: (answers: Record<number, number>) => void;
  onBack: () => void;
}

export function QuizTakingPage({ quiz, onSubmit, onBack }: QuizTakingPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Timer effect
  React.useEffect(() => {
    if (timeRemaining === null) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    onSubmit(answers);
  };

  const isQuestionAnswered = (questionId: number) => {
    return questionId in answers;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignment
          </Button>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-slate-900 mb-2">{quiz.title}</h1>
              <p className="text-slate-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
                <Clock className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Time Remaining</p>
                  <p className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="text-slate-900">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-1">
                    Question {currentQuestionIndex + 1}
                  </h3>
                  <p className="text-slate-700">{currentQuestion.questionText}</p>
                </div>
                {isQuestionAnswered(currentQuestion.id) && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
              </div>
            </div>

            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 border rounded-lg transition-all cursor-pointer ${
                      answers[currentQuestion.id] === index
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-slate-900"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <div className="mb-6">
          <p className="text-sm text-slate-600 mb-3">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg border transition-all ${
                  currentQuestionIndex === index
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : isQuestionAnswered(question.id)
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Submit Quiz
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription>
                {answeredCount < totalQuestions ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      You have {totalQuestions - answeredCount} unanswered question(s).
                    </p>
                    <p>Are you sure you want to submit? Unanswered questions will be marked as incorrect.</p>
                  </div>
                ) : (
                  <p>Are you sure you want to submit your quiz? You won't be able to change your answers after submission.</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmitQuiz} className="bg-indigo-600 hover:bg-indigo-700">
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
