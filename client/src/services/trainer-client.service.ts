import { apiClient } from '@/lib/axios';

export interface ITrainerClientAssignment {
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

export interface IUser {
  id: number;
  email: string;
  level: number;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export const trainerClientApi = {
  // Get all assignments
  async getAssignments(): Promise<ITrainerClientAssignment[]> {
    const response = await apiClient.get('/trainer-clients');
    return response.data;
  },

  // Get trainers (users with trainer role)
  async getTrainers(): Promise<IUser[]> {
    const response = await apiClient.get('/users?role=trainer');
    return response.data.data || response.data;
  },

  // Get clients (users with client role)
  async getClients(): Promise<IUser[]> {
    const response = await apiClient.get('/users?role=client');
    return response.data.data || response.data;
  },

  // Get clients for a specific trainer
  async getTrainerClients(trainerId: number): Promise<ITrainerClientAssignment[]> {
    const response = await apiClient.get(`/trainer-clients/trainer/${trainerId}/clients`);
    return response.data;
  },

  // Get trainers for a specific client
  async getClientTrainers(clientId: number): Promise<ITrainerClientAssignment[]> {
    const response = await apiClient.get(`/trainer-clients/client/${clientId}/trainers`);
    return response.data;
  },

  // Assign trainer to client
  async assignTrainerToClient(trainerId: number, clientId: number): Promise<ITrainerClientAssignment> {
    const response = await apiClient.post('/trainer-clients/assign', {
      trainerId,
      clientId,
    });
    return response.data;
  },

  // Remove assignment by ID
  async removeAssignment(assignmentId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/trainer-clients/${assignmentId}`);
    return response.data;
  },

  // Remove trainer from client
  async removeTrainerFromClient(trainerId: number, clientId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/trainer-clients/trainer/${trainerId}/client/${clientId}`);
    return response.data;
  },
};
