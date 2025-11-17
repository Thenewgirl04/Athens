import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Pretest, PretestQuestion } from '../services/api';

interface PretestModalProps {
  open: boolean;
  onClose: () => void;
  pretest: Pretest;
  onSubmit: (answers: Record<string, number>) => void;
  loading?: boolean;
}

export function PretestModal({
  open,
  onClose,
  pretest,
  onSubmit,
  loading = false,
}: PretestModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = pretest.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / pretest.questions.length) * 100;
  const answeredCount = pretest.questions.filter((q) => answers[q.id] !== undefined).length;
  const unansweredCount = pretest.questions.length - answeredCount;
  const allAnswered = unansweredCount === 0;

  useEffect(() => {
    if (!open) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeRemaining(30 * 60);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < pretest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // If all questions are answered, submit directly
    if (allAnswered) {
      onSubmit(answers);
    } else {
      // Show confirmation dialog for partial submission
      setShowSubmitConfirm(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    onSubmit(answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header - Sticky at top */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <DialogHeader className="px-6 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <DialogTitle>Course Pretest</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </DialogHeader>

          {/* Progress Bar - Fixed at top */}
          <div className="px-6 pb-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Question {currentQuestionIndex + 1} of {pretest.questions.length}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-slate-600">
                  Answered: {answeredCount}/{pretest.questions.length}
                </span>
                <span className="text-slate-600">{Math.round(progress)}%</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            {!allAnswered && (
              <div className="pt-1">
                <Alert className="py-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-xs text-amber-700">
                    {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} unanswered. 
                    Unanswered questions will be marked as incorrect.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>

        {/* Question - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {currentQuestion.question}
            </h3>
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion.id, parseInt(value))
              }
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Question Number Navigation - Compact */}
        <div className="px-6 py-2 border-y bg-slate-50 overflow-x-auto">
          <div className="flex gap-1.5 justify-center flex-wrap min-w-max">
            {pretest.questions.map((_, index) => {
              const isCurrent = index === currentQuestionIndex;
              const isAnswered = answers[pretest.questions[index].id] !== undefined;
              
              // Determine button styles
              let bgColor, textColor, borderColor;
              if (isCurrent) {
                bgColor = '#4f46e5'; // indigo-600
                textColor = '#ffffff'; // white
                borderColor = '#4f46e5';
              } else if (isAnswered) {
                bgColor = '#22c55e'; // green-500
                textColor = '#ffffff'; // white
                borderColor = '#22c55e';
              } else {
                bgColor = '#ffffff'; // white
                textColor = '#334155'; // slate-700
                borderColor = '#94a3b8'; // slate-400
              }
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-7 h-7 rounded text-xs flex-shrink-0 font-semibold transition-all ${
                    isCurrent
                      ? 'ring-2 ring-indigo-600 ring-offset-1 shadow-md'
                      : isAnswered
                      ? 'shadow-sm'
                      : 'border-2 hover:bg-slate-100'
                  }`}
                  style={{
                    minWidth: '28px',
                    minHeight: '28px',
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor: borderColor,
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-slate-600"
            >
              Close
            </Button>
            {currentQuestionIndex < pretest.questions.length - 1 ? (
              <Button 
                onClick={handleNext} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || answeredCount === 0}
                className={`font-semibold ${
                  loading || answeredCount === 0
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                style={{ 
                  backgroundColor: (loading || answeredCount === 0) ? '#94a3b8' : '#16a34a', 
                  color: '#ffffff',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Pretest'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog for Partial Submission */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Submit Pretest with Unanswered Questions?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 mb-4">
              You have answered <strong>{answeredCount} out of {pretest.questions.length}</strong> questions.
            </p>
            <p className="text-sm text-slate-600 mb-2">
              <strong>{unansweredCount} question{unansweredCount !== 1 ? 's' : ''}</strong> will be marked as incorrect.
            </p>
            <p className="text-sm text-slate-500">
              Are you sure you want to submit now?
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
              }}
            >
              Yes, Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

