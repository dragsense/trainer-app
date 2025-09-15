// External Libraries
import { ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { 
  Calendar, 
  User, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Target, 
  Star,
  Award,
  Heart
} from "lucide-react";

// Types
import { ITrainerClient } from "@/@types/trainer-client.type";

// Stores
import { TSingleHandlerStore } from "@/stores";

interface ITrainerClientViewModalProps {
  storeKey: string;
  store: TSingleHandlerStore<ITrainerClient, any>;
}

export default function TrainerClientViewModal({ storeKey, store }: ITrainerClientViewModalProps) {
  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { response: assignment, action, reset } = store(useShallow(state => ({
    response: state.response,
    action: state.action,
    reset: state.reset,
  })));

  if (!assignment) {
    return null;
  }

  const handleCloseView = () => {
    reset();
  };

  return (
    <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <AppDialog
          title="Assignment Details"
          description="View detailed information about this trainer-client assignment"
        >
          <TrainerClientDetailContent assignment={assignment} />
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}

interface ITrainerClientDetailContentProps {
  assignment: ITrainerClient;
}

function TrainerClientDetailContent({ assignment }: ITrainerClientDetailContentProps) {
  // Helper function to render info items
  const InfoItem = ({ icon, label, value, className = "" }: {
    icon: ReactNode;
    label: string;
    value: string | number | undefined | null | ReactNode;
    className?: string;
  }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <p className="font-medium">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  const trainer = assignment.trainer;
  const client = assignment.client;

  return (
    <div className="space-y-6">
      {/* Quick Preview Card */}
      <AppCard className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Trainer-Client Assignment
            </h2>
            <p className="text-indigo-600 font-medium">
              {trainer?.profile ? `${trainer.profile.firstName} ${trainer.profile.lastName}` : trainer?.email} → {client?.profile ? `${client.profile.firstName} ${client.profile.lastName}` : client?.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                Assigned {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="">
        {/* Trainer Information */}
        {trainer && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Trainer Information</span>
                  <p className="text-sm text-muted-foreground">Details about the assigned trainer</p>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={trainer.profile ? `${trainer.profile.firstName} ${trainer.profile.lastName}` : trainer.email}
              />
              <InfoItem
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={trainer.email}
              />
              {trainer.profile?.phoneNumber && (
                <InfoItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone Number"
                  value={trainer.profile.phoneNumber}
                />
              )}
              {trainer.profile?.address && (
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={trainer.profile.address}
                />
              )}
              {trainer.profile?.experience && (
                <InfoItem
                  icon={<Award className="w-4 h-4" />}
                  label="Experience"
                  value={`${trainer.profile.experience} years`}
                />
              )}
              {trainer.profile?.rating && (
                <InfoItem
                  icon={<Star className="w-4 h-4" />}
                  label="Rating"
                  value={`${trainer.profile.rating}/5.0`}
                />
              )}
            </div>
          </AppCard>
        )}

        {/* Client Information */}
        {client && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Client Information</span>
                  <p className="text-sm text-muted-foreground">Details about the assigned client</p>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Full Name"
                value={client.profile ? `${client.profile.firstName} ${client.profile.lastName}` : client.email}
              />
              <InfoItem
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={client.email}
              />
              {client.profile?.phoneNumber && (
                <InfoItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone Number"
                  value={client.profile.phoneNumber}
                />
              )}
              {client.profile?.address && (
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={client.profile.address}
                />
              )}
            </div>
          </AppCard>
        )}

        {/* Trainer Specialties */}
        {trainer?.profile?.specialties && trainer.profile.specialties.length > 0 && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Trainer Specialties</span>
                  <p className="text-sm text-muted-foreground">Areas of expertise for this trainer</p>
                </div>
              </div>
            }
          >
            <div className="flex flex-wrap gap-2">
              {trainer.profile.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline">
                  {specialty}
                </Badge>
              ))}
            </div>
          </AppCard>
        )}

        {/* Client Goals */}
        {client?.profile?.fitnessGoals && client.profile.fitnessGoals.length > 0 && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Client Fitness Goals</span>
                  <p className="text-sm text-muted-foreground">Fitness objectives for this client</p>
                </div>
              </div>
            }
          >
            <div className="flex flex-wrap gap-2">
              {client.profile.fitnessGoals.map((goal, index) => (
                <Badge key={index} variant="outline">
                  {goal}
                </Badge>
              ))}
            </div>
          </AppCard>
        )}

        {/* Assignment Details */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="font-semibold">Assignment Details</span>
                <p className="text-sm text-muted-foreground">Timeline and assignment information</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Assigned Date"
              value={assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleString() : 'Not specified'}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Created At"
              value={new Date(assignment.createdAt).toLocaleString()}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Updated At"
              value={new Date(assignment.updatedAt).toLocaleString()}
            />
          </div>
        </AppCard>

        {/* Trainer Bio */}
        {trainer?.profile?.bio && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Trainer Bio</span>
                  <p className="text-sm text-muted-foreground">Background and experience information</p>
                </div>
              </div>
            }
          >
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm leading-relaxed">
                {trainer.profile.bio}
              </p>
            </div>
          </AppCard>
        )}

        {/* Client Bio */}
        {client?.profile?.bio && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Client Notes</span>
                  <p className="text-sm text-muted-foreground">Additional information about the client</p>
                </div>
              </div>
            }
          >
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm leading-relaxed">
                {client.profile.bio}
              </p>
            </div>
          </AppCard>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            View Sessions
          </Button>
          <Button variant="outline" size="sm">
            View Progress
          </Button>
          <Button variant="outline" size="sm">
            Edit Assignment
          </Button>
          <Button size="sm">
            Manage Relationship
          </Button>
        </div>
      </div>
    </div>
  );
}
