// React & Hooks
import { useState } from "react";

// External Libraries
import { CreditCard, DollarSign, Clock, Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

// Types
import { ISession, ISessionBooking } from "@/@types/session.type";

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

// Stores
import { useRegisteredStore, TSingleHandlerStore } from "@/stores";

// Services
import { bookSession } from "@/services/session.api";

interface ISessionBookingModalProps {
  session: ISession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeKey: string;
  onBookingComplete?: (booking: ISessionBooking) => void;
}

export default function SessionBookingModal({ 
  session, 
  open, 
  onOpenChange,
  onBookingComplete
}: ISessionBookingModalProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return 'bg-blue-100 text-blue-800';
      case 'GROUP':
        return 'bg-green-100 text-green-800';
      case 'PRIVATE':
        return 'bg-purple-100 text-purple-800';
      case 'OPEN':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canBook = () => {
    if (!session) return false;
    if (session.bookingStatus === 'FULL' || session.bookingStatus === 'CANCELLED') return false;
    if (session.type === 'GROUP' && session.currentParticipants >= session.maxParticipants) return false;
    return true;
  };

  const handleBookSession = async () => {
    setIsBooking(true);
    setBookingError(null);

    try {
      const booking = await bookSession(session.id, {
        requirePayment: session.requirePrepayment
      });
      
      if (onBookingComplete) {
        onBookingComplete(booking);
      }

      onOpenChange(false);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'An error occurred while booking');
    } finally {
      setIsBooking(false);
    }
  };

  const isGroupSession = session.type === 'GROUP' || session.maxParticipants > 1;
  const spotsRemaining = isGroupSession ? session.maxParticipants - (session.currentParticipants || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-xl">Book Session</DialogTitle>
            <DialogDescription>Review session details and confirm your booking</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{session.title}</h3>
              <Badge className={getSessionTypeColor(session.type)}>
                {session.type.replace('_', ' ')}
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
                  {session.requirePrepayment && (
                    <span className="text-xs text-orange-600 ml-2">(Prepayment required)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Group Session Info */}
            {isGroupSession && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Group Session</p>
                  <p className="text-sm text-gray-600">
                    {session.currentParticipants || 0} / {session.maxParticipants} participants
                    {spotsRemaining > 0 && (
                      <span className="text-green-600 ml-2">({spotsRemaining} spots remaining)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trainer Info */}
          <div className="space-y-2">
            <p className="font-medium">Trainer</p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.trainer?.profile?.avatar} />
                <AvatarFallback>
                  {session.trainer?.profile?.firstName?.[0]}
                  {session.trainer?.profile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {session.trainer?.profile?.firstName} {session.trainer?.profile?.lastName}
                </p>
                <p className="text-sm text-gray-500">{session.trainer?.email}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {session.location && (
            <div className="space-y-2">
              <p className="font-medium">Location</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{session.location}</p>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <div className="space-y-2">
              <p className="font-medium">About this session</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{session.description}</p>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Cancellation Policy:</strong> You can cancel up to {session.cancellationDeadline} hours before the session starts.
            </div>
          </div>

          {/* Booking Status Alert */}
          {!canBook() && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                {session.bookingStatus === 'FULL' && 'This session is fully booked.'}
                {session.bookingStatus === 'CANCELLED' && 'This session has been cancelled.'}
                {session.type === 'GROUP' && session.currentParticipants >= session.maxParticipants && 'No spots remaining for this group session.'}
              </div>
            </div>
          )}

          {/* Booking Success */}
          {canBook() && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                Ready to book! {session.requirePrepayment ? 'Payment will be processed immediately.' : 'You can pay after the session.'}
              </div>
            </div>
          )}

          {/* Error Message */}
          {bookingError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">{bookingError}</div>
            </div>
          )}

          {/* Booking Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookSession}
              disabled={!canBook() || isBooking}
              className="min-w-[120px]"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {session.requirePrepayment ? `Pay & Book (${session.currency} ${session.price})` : 'Book Session'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
