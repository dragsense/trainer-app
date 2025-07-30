// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { FieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IReminder, TReminderData } from "@/@types/reminder.type";
import { ReminderType, ReminderFrequency } from "#/modules/v1/reminders/enums/reminder.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useStore } from "zustand";

export interface IReminderFormModalProps {
  storeKey: string;
}

export default function ReminderFormModal({
  storeKey
}: IReminderFormModalProps) {

  const formStoreKey = storeKey + "-form";
  const singelStoreKey = storeKey + "-single";

  const formStore = useRegisteredStore<TFormHandlerStore<TReminderData, IReminder>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<IReminder>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const { isSubmitting } = useStore(formStore);
  const { isEditing, isCreating, setResetActions } = useStore(singleStore);

  const fields: FieldConfig[] = [
    // ─── Reminder Basic Info ──────────────
    {
      id: "type",
      name: "type",
      label: "Reminder Type",
      type: "select",
      options: [
        { value: ReminderType.PAYMENT, label: "Payment Reminder" },
        { value: ReminderType.SESSION, label: "Session Reminder" },
        { value: ReminderType.CUSTOM, label: "Custom Reminder" },
      ],
      required: true,
    },
    {
      id: "message",
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Reminder message content...",
      required: true,
    },
    {
      id: "scheduledAt",
      name: "scheduledAt",
      label: "Scheduled Date & Time",
      type: "date",
      required: true,
    },
    {
      id: "frequency",
      name: "frequency",
      label: "Frequency",
      type: "select",
      options: [
        { value: ReminderFrequency.ONCE, label: "Once" },
        { value: ReminderFrequency.DAILY, label: "Daily" },
        { value: ReminderFrequency.WEEKLY, label: "Weekly" },
        { value: ReminderFrequency.MONTHLY, label: "Monthly" },
        { value: ReminderFrequency.HOURLY, label: "Hourly" },
        { value: ReminderFrequency.MINUTELY, label: "Every Few Minutes" },
      ],
      required: true,
    },
    {
      id: "startAt",
      name: "startAt",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      id: "endDate",
      name: "endDate",
      label: "End Date (Optional)",
      type: "date",
      required: false,
    },
    {
      id: "deliveryMethods",
      name: "deliveryMethods",
      label: "Delivery Methods",
      type: "multiSelect",
      options: [
        { value: "EMAIL", label: "Email" },
        { value: "SMS", label: "SMS" },
        { value: "PUSH_NOTIFICATION", label: "Push Notification" },
      ],
      required: true,
    },
    {
      id: "priority",
      name: "priority",
      label: "Priority Level",
      type: "select",
      options: [
        { value: "1", label: "Low (1)" },
        { value: "2", label: "Normal (2)" },
        { value: "3", label: "High (3)" },
        { value: "4", label: "Urgent (4)" },
        { value: "5", label: "Critical (5)" },
      ],
      required: false,
    },
    {
      id: "maxAttempts",
      name: "maxAttempts",
      label: "Max Retry Attempts",
      type: "number",
      placeholder: "3",
      min: 1,
      max: 10,
      required: false,
    },
    {
      id: "retryInterval",
      name: "retryInterval",
      label: "Retry Interval (minutes)",
      type: "number",
      placeholder: "1440",
      min: 1,
      required: false,
    },
    {
      id: "isRecurring",
      name: "isRecurring",
      label: "Recurring Reminder",
      type: "switch",
      required: false,
    },
    {
      id: "recurringInterval",
      name: "recurringInterval",
      label: "Recurring Interval (days)",
      type: "number",
      placeholder: "7",
      min: 1,
      required: false,
    },
    {
      id: "timeOfDay",
      name: "timeOfDay",
      label: "Time of Day (HH:mm)",
      type: "text",
      placeholder: "09:00",
      required: false,
    },
    {
      id: "intervalMinutes",
      name: "intervalMinutes",
      label: "Custom Interval (minutes)",
      type: "number",
      placeholder: "30",
      min: 1,
      required: false,
    },
  ];

  const { inputs } = useInput({
    fields,
    showRequiredAsterisk: true,
  });

  const onOpenChange = (state: boolean) => {
    if (state === false) setResetActions();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          setResetActions();
        }}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Create"}
      </Button>
    </div>
  );

  return <>
    <ModalForm<TReminderData, IReminder>
      title={`${isEditing ? "Edit" : "Create"} Reminder`}
      description={`${isEditing ? "Edit" : "Create a new"} reminder`}
      open={isEditing || isCreating}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {inputs}
      </div>
    </ModalForm>
  </>
}
