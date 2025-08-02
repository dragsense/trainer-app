import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, UserCheck } from 'lucide-react';
import { TrainerClientAssignmentForm } from './forms/assignment-form';
import { AssignmentTable } from './table/assignment-table';
import { toast } from 'sonner';

// Mock API functions - replace with actual API calls
const api = {
  async getTrainers() {
    // Replace with actual API call
    return [
      { id: 1, email: 'trainer1@example.com', profile: { firstName: 'John', lastName: 'Doe' } },
      { id: 2, email: 'trainer2@example.com', profile: { firstName: 'Jane', lastName: 'Smith' } },
    ];
  },
  
  async getClients() {
    // Replace with actual API call
    return [
      { id: 3, email: 'client1@example.com', profile: { firstName: 'Mike', lastName: 'Johnson' } },
      { id: 4, email: 'client2@example.com', profile: { firstName: 'Sarah', lastName: 'Wilson' } },
    ];
  },
  
  async getAssignments() {
    // Replace with actual API call
    return [
      {
        id: 1,
        trainerId: 1,
        clientId: 3,
        assignedAt: new Date().toISOString(),
        trainer: { id: 1, email: 'trainer1@example.com', profile: { firstName: 'John', lastName: 'Doe' } },
        client: { id: 3, email: 'client1@example.com', profile: { firstName: 'Mike', lastName: 'Johnson' } },
      },
    ];
  },
  
  async assignTrainerToClient(trainerId: number, clientId: number) {
    // Replace with actual API call
    const response = await fetch('/api/trainer-clients/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, clientId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign trainer to client');
    }
    
    return response.json();
  },
  
  async removeAssignment(assignmentId: number) {
    // Replace with actual API call
    const response = await fetch(`/api/trainer-clients/${assignmentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove assignment');
    }
    
    return response.json();
  },
};

export const TrainerClientsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assignmentsData, trainersData, clientsData] = await Promise.all([
        api.getAssignments(),
        api.getTrainers(),
        api.getClients(),
      ]);
      
      setAssignments(assignmentsData);
      setTrainers(trainersData);
      setClients(clientsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (trainerId: number, clientId: number) => {
    await api.assignTrainerToClient(trainerId, clientId);
    await loadData(); // Refresh the list
  };

  const handleRemove = async (assignmentId: number) => {
    try {
      await api.removeAssignment(assignmentId);
      toast.success('Assignment removed successfully');
      await loadData(); // Refresh the list
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trainer-Client Assignments</h1>
          <p className="text-muted-foreground">Manage trainer and client relationships</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Assign Trainer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Trainer to Client</DialogTitle>
            </DialogHeader>
            <TrainerClientAssignmentForm
              trainers={trainers}
              clients={clients}
              onAssign={handleAssign}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <AssignmentTable
        assignments={assignments}
        onRemove={handleRemove}
        isLoading={isLoading}
      />
    </div>
  );
};
