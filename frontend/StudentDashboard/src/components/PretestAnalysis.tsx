import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { PretestResultResponse, TopicPerformance } from '../services/api';

interface PretestAnalysisProps {
  result: PretestResultResponse;
  onContinue: () => void;
}

export function PretestAnalysis({ result, onContinue }: PretestAnalysisProps) {
  const { analysis, recommendation } = result;
  const { percentage, performanceLevel, topicBreakdown, strengths, weaknesses } = analysis;

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'moderate_plus':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'below_moderate':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'fail':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-900';
    }
  };

  const getPerformanceLabel = (level: string) => {
    switch (level) {
      case 'moderate_plus':
        return 'Moderate+';
      case 'below_moderate':
        return 'Below Moderate';
      case 'fail':
        return 'Fail';
      default:
        return level;
    }
  };

  const getTopicPerformanceColor = (level: string) => {
    switch (level) {
      case 'strong':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'course':
        return '🎓';
      case 'pdf':
        return '📕';
      default:
        return '🔗';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Pretest Results</CardTitle>
              <CardDescription className="mt-2">
                Your performance analysis and recommendations
              </CardDescription>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getPerformanceColor(performanceLevel)}`}>
              {getPerformanceLabel(performanceLevel)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-indigo-600">
              {Math.round(percentage)}%
            </div>
            <div className="text-slate-600">
              {analysis.overallScore} out of {analysis.maxScore} questions correct
            </div>
            <Progress value={percentage} className="h-3 mt-4" />
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Strengths
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  {strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">
                    Areas for Improvement
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                  {weaknesses.map((weakness, index) => (
                    <li key={index}>• {weakness}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Topic-by-Topic Performance
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your performance across different topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topicBreakdown.map((topic: TopicPerformance) => (
              <div key={topic.topicId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{topic.topicTitle}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      {topic.correctCount}/{topic.questionsCount}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPerformanceColor(topic.performanceLevel)}`}
                    >
                      {topic.performanceLevel}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={topic.percentage}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-slate-600 w-12 text-right">
                    {Math.round(topic.percentage)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Recommended Resource
            </CardTitle>
            <CardDescription>
              We've identified an area where you could benefit from additional study
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{recommendation.topicTitle}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {recommendation.recommendation}
              </p>
            </div>
            <Button
              asChild
              className="w-full"
              variant="outline"
            >
              <a
                href={recommendation.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <span>{getResourceIcon(recommendation.resourceType)}</span>
                <span>Open Resource</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={onContinue} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          Continue to Course
        </Button>
      </div>
    </div>
  );
}

