import React, { useState } from 'react';
import { AssignmentDetails } from './AssignmentDetails';
import { QuizTakingPage, QuizQuestion, QuizData } from './QuizTakingPage';
import { QuizResultsPage, QuizResult } from './QuizResultsPage';
import { QuizFeedbackPage, QuizFeedbackData } from './QuizFeedbackPage';
import type { Assignment } from './AssignmentCard';

interface AssignmentFlowProps {
  assignment: Assignment;
  onBack: () => void;
}

// Sample quiz data - in a real app this would come from an API
const getQuizDataForAssignment = (assignmentId: number): QuizData => {
  const sampleQuestions: QuizQuestion[] = [
    {
      id: 1,
      questionText: 'What is the correct syntax to output "Hello World" in Python?',
      options: [
        'echo("Hello World")',
        'print("Hello World")',
        'printf("Hello World")',
        'console.log("Hello World")',
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      questionText: 'Which of the following is a valid variable name in Python?',
      options: [
        '2variable',
        'variable-name',
        'variable_name',
        'variable name',
      ],
      correctAnswer: 2,
    },
    {
      id: 3,
      questionText: 'What does the "len()" function do in Python?',
      options: [
        'Returns the length of an object',
        'Converts a number to a string',
        'Creates a new list',
        'Deletes a variable',
      ],
      correctAnswer: 0,
    },
    {
      id: 4,
      questionText: 'Which keyword is used to define a function in Python?',
      options: [
        'function',
        'def',
        'func',
        'define',
      ],
      correctAnswer: 1,
    },
    {
      id: 5,
      questionText: 'What is the output of: print(type([]))?',
      options: [
        '<class \'dict\'>',
        '<class \'tuple\'>',
        '<class \'list\'>',
        '<class \'set\'>',
      ],
      correctAnswer: 2,
    },
  ];

  return {
    title: 'Python Basics Quiz',
    questions: sampleQuestions,
    totalPoints: 100,
  };
};

type FlowState = 'details' | 'taking' | 'results' | 'feedback';

export function AssignmentFlow({ assignment, onBack }: AssignmentFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>('details');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const quizData = getQuizDataForAssignment(assignment.id);

  const handleStartQuiz = () => {
    setFlowState('taking');
  };

  const handleSubmitQuiz = (answers: Record<number, number>) => {
    setQuizAnswers(answers);

    // Calculate score
    let correctCount = 0;
    quizData.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = quizData.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const earnedPoints = Math.round((percentage / 100) * quizData.totalPoints);

    const result: QuizResult = {
      score: correctCount,
      totalQuestions: totalQuestions,
      totalPoints: quizData.totalPoints,
      earnedPoints: earnedPoints,
      percentage: percentage,
      submissionTime: new Date().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      attemptNumber: 1,
      status: 'auto-graded',
      quizTitle: quizData.title,
    };

    setQuizResult(result);
    setFlowState('results');
  };

  const handleViewSubmission = () => {
    if (flowState === 'details' && assignment.status === 'graded') {
      // If already graded, jump directly to feedback
      setFlowState('feedback');
    } else {
      // Otherwise go to results first
      setFlowState('feedback');
    }
  };

  const handleBackToAssignments = () => {
    setFlowState('details');
    onBack();
  };

  const handleBackToDetails = () => {
    setFlowState('details');
  };

  // Render based on current flow state
  switch (flowState) {
    case 'details':
      return (
        <AssignmentDetails
          assignment={assignment}
          onBack={onBack}
          onStartQuiz={handleStartQuiz}
          onViewSubmission={handleViewSubmission}
        />
      );

    case 'taking':
      return (
        <QuizTakingPage
          quiz={quizData}
          onSubmit={handleSubmitQuiz}
          onBack={handleBackToDetails}
        />
      );

    case 'results':
      return quizResult ? (
        <QuizResultsPage
          result={quizResult}
          onViewSubmission={() => setFlowState('feedback')}
          onBackToAssignments={handleBackToAssignments}
        />
      ) : null;

    case 'feedback':
      const feedbackData: QuizFeedbackData = {
        quizTitle: quizData.title,
        questions: quizData.questions,
        userAnswers: quizAnswers,
        score: quizResult?.score || 0,
        totalQuestions: quizData.questions.length,
        totalPoints: quizData.totalPoints,
        earnedPoints: quizResult?.earnedPoints || 0,
        percentage: quizResult?.percentage || 0,
      };

      return (
        <QuizFeedbackPage
          feedbackData={feedbackData}
          onBackToAssignments={handleBackToAssignments}
        />
      );

    default:
      return null;
  }
}
