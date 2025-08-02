import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ITrainerClientAssignment {
  id: number;
  trainerId: number;
  clientId: number;
  assignedAt: string;
  trainer: {
    id: number;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  client: {
    id: number;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface IAssignmentTableProps {
  assignments: ITrainerClientAssignment[];
  onRemove: (assignmentId: number) => Promise<void>;
  isLoading?: boolean;
}

export const AssignmentTable: React.FC<IAssignmentTableProps> = ({
  assignments,
  onRemove,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No trainer-client assignments found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Trainer-Client Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Trainer</div>
                    <div className="font-semibold">
                      {assignment.trainer.profile?.firstName} {assignment.trainer.profile?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{assignment.trainer.email}</div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Client</div>
                    <div className="font-semibold">
                      {assignment.client.profile?.firstName} {assignment.client.profile?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{assignment.client.email}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Assigned: {format(new Date(assignment.assignedAt), 'MMM dd, yyyy')}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
