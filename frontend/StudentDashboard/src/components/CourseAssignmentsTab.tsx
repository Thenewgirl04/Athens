import React, { useState } from 'react';
import { AlertCircle, CalendarClock, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { AssignmentCard, Assignment as AssignmentType } from './AssignmentCard';
import { AssignmentDetails } from './AssignmentDetails';
import { AssignmentFlow } from './AssignmentFlow';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface CourseAssignmentsTabProps {
  assignments: AssignmentType[];
}

type FilterType = 'all' | 'not-submitted' | 'to-be-graded' | 'graded' | 'overdue' | 'upcoming';

export function CourseAssignmentsTab({ assignments }: CourseAssignmentsTabProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentType | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [undatedOpen, setUndatedOpen] = useState(true);

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'not-submitted', label: 'Not Submitted' },
    { id: 'to-be-graded', label: 'To Be Graded' },
    { id: 'graded', label: 'Graded' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  const filterAssignments = (assignmentsList: AssignmentType[]): AssignmentType[] => {
    if (selectedFilter === 'all') return assignmentsList;

    switch (selectedFilter) {
      case 'not-submitted':
        return assignmentsList.filter(a => a.status === 'not-submitted' || a.status === 'missing');
      case 'to-be-graded':
        return assignmentsList.filter(a => a.status === 'submitted');
      case 'graded':
        return assignmentsList.filter(a => a.status === 'graded');
      case 'overdue':
        return assignmentsList.filter(a => a.category === 'overdue');
      case 'upcoming':
        return assignmentsList.filter(a => a.category === 'upcoming');
      default:
        return assignmentsList;
    }
  };

  const filteredAssignments = filterAssignments(assignments);
  const overdueAssignments = filteredAssignments.filter(a => a.category === 'overdue');
  const upcomingAssignments = filteredAssignments.filter(a => a.category === 'upcoming');
  const undatedAssignments = filteredAssignments.filter(a => a.category === 'undated');

  if (selectedAssignment) {
    return (
      <AssignmentFlow
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterButtons.map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
            className={
              selectedFilter === filter.id
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : ''
            }
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Overdue Assignments */}
        {overdueAssignments.length > 0 && (
          <Collapsible open={overdueOpen} onOpenChange={setOverdueOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-red-600">
                      Overdue Assignments ({overdueAssignments.length})
                    </h3>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                {overdueAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => setSelectedAssignment(assignment)}
                  />
                ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* Upcoming Assignments */}
        {upcomingAssignments.length > 0 && (
          <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-amber-600" />
                    <h3 className="text-amber-600">
                      Upcoming Assignments ({upcomingAssignments.length})
                    </h3>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => setSelectedAssignment(assignment)}
                  />
                ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* Undated Assignments */}
        {undatedAssignments.length > 0 && (
          <Collapsible open={undatedOpen} onOpenChange={setUndatedOpen}>
            <div className="space-y-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 p-0 h-auto hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <h3 className="text-slate-600">
                      Undated Assignments ({undatedAssignments.length})
                    </h3>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                {undatedAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => setSelectedAssignment(assignment)}
                  />
                ))}
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* Empty State */}
        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 mb-2">No assignments found</h3>
            <p className="text-slate-500">
              Try adjusting your filters to see more assignments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}