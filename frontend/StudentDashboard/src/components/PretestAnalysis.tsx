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
    <div className="space-y-8 py-8">
      {/* Top Row: Score, Strengths, Weaknesses - 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-4">
              <CardDescription className="text-base text-slate-600 font-medium">
                Overall Score
              </CardDescription>
              <Badge className={`text-lg px-4 py-2 ${getPerformanceColor(performanceLevel)}`}>
                {getPerformanceLabel(performanceLevel)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-indigo-600">
                {Math.round(percentage)}%
              </div>
              <div className="text-base text-slate-600">
                {analysis.overallScore} / {analysis.maxScore} questions
              </div>
              <Progress value={percentage} className="h-4 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Strengths Card */}
        {strengths.length > 0 && (
          <Card className="border-0 shadow-lg bg-green-50 dark:bg-green-900/20">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Strengths
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-base text-green-800 dark:text-green-200">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1 text-lg">•</span>
                    <span className="flex-1 leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses Card */}
        {weaknesses.length > 0 && (
          <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <CardTitle className="text-xl font-semibold text-red-900 dark:text-red-100">
                  Areas for Improvement
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-base text-red-800 dark:text-red-200">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-600 mt-1 text-lg">•</span>
                    <span className="flex-1 leading-relaxed">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Topic Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <TrendingUp className="w-6 h-6" />
            Topic-by-Topic Performance
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Detailed breakdown of your performance across different topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {topicBreakdown.map((topic: TopicPerformance) => (
              <div key={topic.topicId} className="space-y-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-base flex-1">{topic.topicTitle}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-right">
                      {topic.correctCount}/{topic.questionsCount}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs px-3 py-1 ${getPerformanceColor(topic.performanceLevel)}`}
                    >
                      {topic.performanceLevel}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-600 w-12 text-right">
                      {Math.round(topic.percentage)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={topic.percentage}
                  className="h-2.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 border-2 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Recommended Resource
            </CardTitle>
            <CardDescription className="text-base mt-2">
              We've identified an area where you could benefit from additional study
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">{recommendation.topicTitle}</h4>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation.recommendation}
              </p>
            </div>
            <Button
              asChild
              className="w-full h-12 text-base"
              variant="outline"
            >
              <a
                href={recommendation.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <span className="text-xl">{getResourceIcon(recommendation.resourceType)}</span>
                <span>Open Resource</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={onContinue} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-base px-8 py-6">
          Continue to Course
        </Button>
      </div>
    </div>
  );
}

