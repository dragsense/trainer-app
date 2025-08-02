import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ITrainerClientAssignmentFormProps {
  trainers: Array<{ id: number; profile?: { firstName: string; lastName: string; }; email: string; }>;
  clients: Array<{ id: number; profile?: { firstName: string; lastName: string; }; email: string; }>;
  onAssign: (trainerId: number, clientId: number) => Promise<void>;
  onClose: () => void;
}

export const TrainerClientAssignmentForm: React.FC<ITrainerClientAssignmentFormProps> = ({
  trainers,
  clients,
  onAssign,
  onClose
}) => {
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTrainer || !selectedClient) {
      toast.error('Please select both trainer and client');
      return;
    }

    setIsLoading(true);
    try {
      await onAssign(parseInt(selectedTrainer), parseInt(selectedClient));
      toast.success('Trainer assigned to client successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to assign trainer to client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trainer">Select Trainer</Label>
        <Select value={selectedTrainer} onValueChange={setSelectedTrainer} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a trainer" />
          </SelectTrigger>
          <SelectContent>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id.toString()}>
                {trainer.profile?.firstName} {trainer.profile?.lastName} ({trainer.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Select Client</Label>
        <Select value={selectedClient} onValueChange={setSelectedClient} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.profile?.firstName} {client.profile?.lastName} ({client.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Assigning...' : 'Assign Trainer'}
        </Button>
      </div>
    </form>
  );
};
