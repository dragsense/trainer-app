// External Libraries
import { ReactNode, useMemo } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { 
  Calendar, 
  Clock, 
  Bell, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Target, 
  Repeat, 
  Timer, 
  Hash, 
  RefreshCcw, 
  AlertTriangle,
  Tag
} from "lucide-react";

// Types
import { IReminder } from "@/@types/reminder.type";

// Stores
import { TSingleHandlerStore } from "@/stores";

interface IReminderViewModalProps {
  storeKey: string;
  store: TSingleHandlerStore<IReminder, any>;
}

export default function ReminderViewModal({ storeKey, store }: IReminderViewModalProps) {
  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { response: reminder, action, reset } = store(useShallow(state => ({
    response: state.response,
    action: state.action,
    reset: state.reset,
  })));

  if (!reminder) {
    return null;
  }

  const handleCloseView = () => {
    reset();
  };

  return (
    <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <AppDialog
          title="Reminder Details"
          description="View detailed information about this reminder"
        >
          <ReminderDetailContent reminder={reminder} />
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}

interface IReminderDetailContentProps {
  reminder: IReminder;
}

function ReminderDetailContent({ reminder }: IReminderDetailContentProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'SENT': return 'outline';
      case 'PENDING': return 'secondary';
      case 'FAILED': return 'destructive';
      case 'CANCELLED': return 'destructive';
      case 'RETRY': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT': return 'default';
      case 'SESSION': return 'secondary';
      case 'CUSTOM': return 'outline';
      default: return 'secondary';
    }
  };

  const friendlyWeekdays = useMemo(() => {
    if (!reminder.weekdays?.length) return "-";
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return reminder.weekdays.map((d) => names[d] ?? String(d)).join(", ");
  }, [reminder.weekdays]);

  return (
    <div className="space-y-6">
      {/* Quick Preview Card */}
      <AppCard className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {reminder.type} Reminder
            </h2>
            <p className="text-purple-600 font-medium">
              {reminder.message || 'No message provided'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getStatusColor(reminder.status)}>
                {reminder.status.replace('_', ' ')}
              </Badge>
              <Badge variant={getTypeColor(reminder.type)}>
                {reminder.type}
              </Badge>
              {reminder.isRecurring && (
                <Badge variant="outline" className="text-blue-600">
                  Recurring
                </Badge>
              )}
            </div>
          </div>
        </div>
      </AppCard>

      <div className="">
        {/* Basic Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <div>
                <span className="font-semibold">Basic Information</span>
                <p className="text-sm text-muted-foreground">Reminder type, status, and priority</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<Bell className="w-4 h-4" />}
              label="Type"
              value={reminder.type}
            />
            <InfoItem
              icon={<Target className="w-4 h-4" />}
              label="Status"
              value={reminder.status.replace('_', ' ')}
            />
            <InfoItem
              icon={<Tag className="w-4 h-4" />}
              label="Priority"
              value={reminder.priority || 'Normal'}
            />
            <InfoItem
              icon={<Repeat className="w-4 h-4" />}
              label="Frequency"
              value={reminder.frequency?.toString().replace('_', ' ') || 'Once'}
            />
          </div>
        </AppCard>

        {/* Message Content */}
        {reminder.message && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Message Content</span>
                  <p className="text-sm text-muted-foreground">The reminder message to be sent</p>
                </div>
              </div>
            }
          >
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reminder.message}
              </p>
            </div>
          </AppCard>
        )}

        {/* Scheduling Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="font-semibold">Scheduling Information</span>
                <p className="text-sm text-muted-foreground">When and how often the reminder is scheduled</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Scheduled At"
              value={reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleString() : 'Not scheduled'}
            />
            <InfoItem
              icon={<Clock className="w-4 h-4" />}
              label="Time of Day"
              value={reminder.timeOfDay || 'Not specified'}
            />
            <InfoItem
              icon={<Timer className="w-4 h-4" />}
              label="Interval Minutes"
              value={reminder.intervalMinutes || 'Not specified'}
            />
            <InfoItem
              icon={<Hash className="w-4 h-4" />}
              label="Weekdays (Weekly)"
              value={friendlyWeekdays}
            />
            <InfoItem
              icon={<Hash className="w-4 h-4" />}
              label="Month Days (Monthly)"
              value={reminder.monthDays?.length ? reminder.monthDays.join(", ") : 'Not specified'}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="End Date"
              value={reminder.endDate ? new Date(reminder.endDate).toLocaleDateString() : 'No end date'}
            />
          </div>
        </AppCard>

        {/* Delivery Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <div>
                <span className="font-semibold">Delivery Information</span>
                <p className="text-sm text-muted-foreground">How the reminder is delivered and retry settings</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<Mail className="w-4 h-4" />}
              label="Delivery Methods"
              value={reminder.deliveryMethods?.length ? (
                <div className="flex flex-wrap gap-2">
                  {reminder.deliveryMethods.map((method, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              ) : 'Not specified'}
            />
            <InfoItem
              icon={<RefreshCcw className="w-4 h-4" />}
              label="Max Attempts"
              value={reminder.maxAttempts || 'Unlimited'}
            />
            <InfoItem
              icon={<Timer className="w-4 h-4" />}
              label="Retry Interval (minutes)"
              value={reminder.retryInterval || 'Not specified'}
            />
            <InfoItem
              icon={<RefreshCcw className="w-4 h-4" />}
              label="Sent Count"
              value={reminder.sentCount || 0}
            />
            <InfoItem
              icon={<RefreshCcw className="w-4 h-4" />}
              label="Retry Count"
              value={reminder.retryCount || 0}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Sent At"
              value={reminder.sentAt ? new Date(reminder.sentAt).toLocaleString() : 'Not sent yet'}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Next Retry At"
              value={reminder.nextRetryAt ? new Date(reminder.nextRetryAt).toLocaleString() : 'No retry scheduled'}
            />
          </div>
        </AppCard>

        {/* Error Information */}
        {reminder.lastError && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <span className="font-semibold text-red-700">Error Information</span>
                  <p className="text-sm text-muted-foreground">Last error that occurred during delivery</p>
                </div>
              </div>
            }
          >
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-sm text-red-700">{reminder.lastError}</p>
            </div>
          </AppCard>
        )}

        {/* Related Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <div>
                <span className="font-semibold">Related Information</span>
                <p className="text-sm text-muted-foreground">Associated users, sessions, and billing</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {reminder.recipient && (
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Recipient"
                value={
                  <div>
                    <div className="font-medium">
                      {reminder.recipient.profile 
                        ? `${reminder.recipient.profile.firstName} ${reminder.recipient.profile.lastName}`
                        : reminder.recipient.email
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">{reminder.recipient.email}</div>
                  </div>
                }
              />
            )}
            
            {reminder.creator && (
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Created By"
                value={
                  <div>
                    <div className="font-medium">
                      {reminder.creator.profile 
                        ? `${reminder.creator.profile.firstName} ${reminder.creator.profile.lastName}`
                        : reminder.creator.email
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">{reminder.creator.email}</div>
                  </div>
                }
              />
            )}

            {reminder.session && (
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Related Session"
                value={
                  <div>
                    <div className="font-medium">{reminder.session.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {reminder.session.dateTime ? new Date(reminder.session.dateTime).toLocaleString() : 'No date'}
                    </div>
                  </div>
                }
              />
            )}

            {reminder.billing && (
              <InfoItem
                icon={<Tag className="w-4 h-4" />}
                label="Related Billing"
                value={
                  <div>
                    <div className="font-medium">
                      {reminder.billing.status} • {reminder.billing.invoiceAmount || 0} {reminder.billing.currency || ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reminder.billing.stripeInvoiceId || 'No invoice ID'}
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </AppCard>

        {/* Additional Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="font-semibold">Additional Information</span>
                <p className="text-sm text-muted-foreground">Creation and update timestamps</p>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Created At"
              value={new Date(reminder.createdAt).toLocaleString()}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Updated At"
              value={new Date(reminder.updatedAt).toLocaleString()}
            />
          </div>
        </AppCard>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            Edit Reminder
          </Button>
          <Button variant="outline" size="sm">
            Resend Now
          </Button>
          <Button size="sm">
            View Related
          </Button>
        </div>
      </div>
    </div>
  );
}