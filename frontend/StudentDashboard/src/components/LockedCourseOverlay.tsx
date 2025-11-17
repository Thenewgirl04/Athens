import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface LockedCourseOverlayProps {
  onTakePretest: () => void;
}

export function LockedCourseOverlay({ onTakePretest }: LockedCourseOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Course Locked</CardTitle>
          <CardDescription className="text-base mt-2">
            Complete the pretest to unlock all course sections and start learning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              About the Pretest
            </h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>Assesses your prior knowledge</li>
              <li>Takes about 10-15 minutes</li>
              <li>Helps personalize your learning experience</li>
              <li>Unlocks course content upon completion</li>
            </ul>
          </div>
          <Button
            onClick={onTakePretest}
            className="w-full"
            size="lg"
          >
            Take Pretest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

