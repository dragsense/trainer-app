// ReminderViewModal.tsx
// React & Hooks
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

// External Libraries
import {
  Calendar,
  Clock,
  Repeat,
  User as UserIcon,
  Bell,
  Mail,
  RefreshCcw,
  AlertTriangle,
  Tag,
  Timer,
  Hash,
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Stores
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Types
import { IReminder } from "@/@types/reminder.type";


interface IReminderViewModalProps {
  storeKey: string;
}

export default function ReminderViewModal({ storeKey }: IReminderViewModalProps) {


  const singleStoreKey = storeKey + "-single";
   const singleStore = useRegisteredStore<TSingleHandlerStore<IReminder>>(singleStoreKey);
 
   if (!singleStore) {
     return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
   }

  const { response: reminder, action, reset } = singleStore(
    useShallow((state) => ({
      response: state.response,
      action: state.action,
      reset: state.reset,
    }))
  );

  if (!reminder) return null

  const handleCloseView = () => {
    reset();
  };

  const friendlyWeekdays = useMemo(() => {
    if (!reminder.weekdays?.length) return "-";
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return reminder.weekdays.map((d) => names[d] ?? String(d)).join(", ");
    // Handles 0 (Sun) to 6 (Sat)
  }, [reminder.weekdays]);

  const actionsBadges = useMemo(() => {
    if (!reminder.actions?.length) return <span className="text-gray-500">-</span>;
    return (
      <div className="flex flex-wrap gap-2">
        {reminder.actions.map((a) => (
          <Badge key={a} variant="secondary" className="capitalize">
            {a.toString().replace("_", " ").toLowerCase()}
          </Badge>
        ))}
      </div>
    );
  }, [reminder.actions]);


  const enumChip = (value?: string) =>
    value ? (
      <Badge>{value.replace("_", " ")}</Badge>
    ) : (
      <span className="text-gray-500">-</span>
    );

  return (
    <Dialog open={action === "view"} onOpenChange={handleCloseView}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder
                <Badge variant="outline" className="ml-2">
                  {reminder.id}
                </Badge>
              </DialogTitle>
              <DialogDescription>Reminder Details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type / Status / Priority */}
          <div className="flex items-center gap-3 flex-wrap">
            {enumChip(reminder.type)}
            {enumChip(reminder.status)}
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Priority: {reminder.priority ?? "-"}
            </Badge>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Scheduled At</p>
                <p className="text-sm text-gray-600">{reminder.scheduledAt?.toDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Sent At</p>
                <p className="text-sm text-gray-600">{reminder.sentAt?.toDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Actions
            </p>
            {actionsBadges}
          </div>

          {/* Message */}
          {reminder.message && (
            <div>
              <p className="font-medium">Message</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {reminder.message}
              </p>
            </div>
          )}

          {/* Recurrence & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Repeat className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Frequency</p>
                <p className="text-sm text-gray-600">
                  {reminder.frequency?.toString().replace("_", " ") ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Time of Day</p>
                <p className="text-sm text-gray-600">{reminder.timeOfDay ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Interval Minutes</p>
                <p className="text-sm text-gray-600">{reminder.intervalMinutes ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshCcw className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Recurring</p>
                <p className="text-sm text-gray-600">
                  {reminder.isRecurring ? `Yes (${reminder.recurringInterval ?? "-"} days)` : "No"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">End Date</p>
                <p className="text-sm text-gray-600">{reminder.endDate?.toDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Weekdays (Weekly)</p>
                <p className="text-sm text-gray-600">{friendlyWeekdays}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Month Days (Monthly)</p>
                <p className="text-sm text-gray-600">
                  {reminder.monthDays?.length ? reminder.monthDays.join(", ") : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery attempts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Sent Count</p>
              <p className="text-sm text-gray-600">{reminder.sentCount ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Max Attempts</p>
              <p className="text-sm text-gray-600">{reminder.maxAttempts ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Retry Interval (minutes)</p>
              <p className="text-sm text-gray-600">{reminder.retryInterval ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Retry Count</p>
              <p className="text-sm text-gray-600">{reminder.retryCount ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Next Retry At</p>
              <p className="text-sm text-gray-600">{reminder.nextRetryAt?.toDateString()}</p>
            </div>
          </div>

          {/* Error */}
          {reminder.lastError && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Last Error</p>
                <p className="text-sm text-gray-700">{reminder.lastError}</p>
              </div>
            </div>
          )}

          {/* Relations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminder.recipient && (
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Recipient</p>
                  <p className="text-sm text-gray-600">
                    {reminder.recipient?.profile?.firstName ?? reminder.recipient.email}
                  </p>
                </div>
              </div>
            )}

            {reminder.creator && (
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Creator</p>
                  <p className="text-sm text-gray-600">
                    {reminder.creator?.profile?.firstName ?? reminder.creator.email}
                  </p>
                </div>
              </div>
            )}

            {reminder.session && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Session</p>
                  <p className="text-sm text-gray-600">
                    {reminder.session.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reminder.session.dateTime ? reminder.session.dateTime.toDateString() : ""}
                  </p>
                </div>
              </div>
            )}

            {reminder.billing && (
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Billing</p>
                  <p className="text-sm text-gray-600">
                    {reminder.billing.status ?? "-"} • {reminder.billing.invoiceAmount ?? 0}{" "}
                    {reminder.billing.currency ?? ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Audit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Created At</p>
              <p className="text-sm text-gray-600">{reminder.createdAt.toDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Updated At</p>
              <p className="text-sm text-gray-600">{reminder.updatedAt.toDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
