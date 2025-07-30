// React & Hooks
import { useState } from "react";

// External Libraries
import { Edit2, MapPin, Clock, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Components
import SessionFormModal from "../form/session-form-modal";

// Stores
import { useStore } from "zustand";
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ISessionViewModalProps {
  session: ISession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeKey: string;
}

export default function SessionViewModal({ 
  session, 
  open, 
  onOpenChange,
  storeKey 
}: ISessionViewModalProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const singleStoreKey = storeKey + "-single";
  const singleStore = useRegisteredStore<TSingleHandlerStore<ISession>>(singleStoreKey);

  const { setMode } = useStore(singleStore!);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return 'bg-blue-100 text-blue-800';
      case 'GROUP':
        return 'bg-green-100 text-green-800';
      case 'CONSULTATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setMode('edit', session.id);
    onOpenChange(false);
  };

  if (showEditForm) {
    return <SessionFormModal storeKey={storeKey} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{session.title}</DialogTitle>
              <DialogDescription>Session Details</DialogDescription>
            </div>
            <Button onClick={handleEdit} size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            <Badge className={getSessionTypeColor(session.type)}>
              {session.type.replace('_', ' ')}
            </Badge>
            <Badge className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(session.dateTime), 'PPP')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(session.dateTime), 'p')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-gray-600">{session.duration} minutes</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Price</p>
              <p className="text-sm text-gray-600">
                {session.currency} {session.price}
              </p>
            </div>
          </div>

          {/* Trainer and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trainer */}
            <div className="space-y-2">
              <p className="font-medium">Trainer</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.trainer?.profile?.avatar} />
                  <AvatarFallback>
                    {session.trainer?.profile?.firstName?.[0]}
                    {session.trainer?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {session.trainer?.profile?.firstName} {session.trainer?.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{session.trainer?.email}</p>
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <p className="font-medium">Client</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.client?.profile?.avatar} />
                  <AvatarFallback>
                    {session.client?.profile?.firstName?.[0]}
                    {session.client?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {session.client?.profile?.firstName} {session.client?.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{session.client?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          {session.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-gray-600">{session.location}</p>
              </div>
            </div>
          )}

          {/* Max Participants */}
          {session.maxParticipants && session.maxParticipants > 1 && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Max Participants</p>
                <p className="text-sm text-gray-600">{session.maxParticipants} people</p>
              </div>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <p className="font-medium">Description</p>
              </div>
              <p className="text-sm text-gray-600 ml-8">{session.description}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-700">Prepayment Required</p>
              <p className="text-sm text-gray-600">
                {session.requirePrepayment ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Cancellation Deadline</p>
              <p className="text-sm text-gray-600">
                {session.cancellationDeadline} hours before
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
