// External Libraries
import React, { JSX, useState } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useUserListInput } from "@/hooks/use-user-list-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IReminder, TReminderData } from "@/@types/reminder.type";
import { ReminderType, ReminderFrequency, ReminderActions } from "#/modules/v1/reminders/enums/reminder.enum";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Stores
import { useStore } from "zustand";
import { useSessionListInput } from "@/hooks/use-session-list-input";
import { useBillingListInput } from "@/hooks/use-billing-list-input";

export interface IReminderFormModalProps {
  storeKey: string;
}

export default function ReminderFormModal({
  storeKey
}: IReminderFormModalProps) {

  const formStoreKey = storeKey + "-form";
  const singleStoreKey = storeKey + "-single";

  // Move store calls to top level - this fixes the hook rendering issue
  const formStore = useRegisteredStore<TFormHandlerStore<TReminderData, IReminder>>(formStoreKey);
  const singleStore = useRegisteredStore<TSingleHandlerStore<IReminder>>(singleStoreKey);

  // Handle missing stores after hooks are called
  if (!formStore) {
    return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
  }

  if (!singleStore) {
    return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { isSubmitting, values } = useStore(formStore);
  const { isEditing, isCreating, setResetActions } = useStore(singleStore);


  const userInput = useUserListInput({
    isSubmitting,
    multiple: false,
    level: UserLevels[UserRole.USER],
    prefix: "recipient",
    valueType: "number"
  });


  const sessionInput = useSessionListInput({
    isSubmitting,
    multiple: false,
    prefix: "session",
    valueType: "number"
  });

  const billingInput = useBillingListInput({
    isSubmitting,
    multiple: false,
    prefix: "billing",
    valueType: "number"
  });

  // Base fields
  const categorizedFields: { category: string; fields: TFieldConfig[] }[] = [
    {
      category: "Basic Information",
      fields: [
        {
          id: "type",
          name: "type",
          label: "Reminder Type",
          type: "select",
          options: [
            { value: ReminderType.BILLING, label: "Payment Reminder" },
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
          placeholder: "Enter reminder message...",
          required: true,
        },
        {
          id: "scheduledAt",
          name: "scheduledAt",
          label: "Scheduled Date & Time",
          type: "datetime",
          required: true,
        },
        {
          id: "endDate",
          name: "endDate",
          label: "End Date (Optional)",
          type: "date",
          required: false,
        },
      ],
    },
    {
      category: "Recipient & Session",
      fields: [
         ...userInput,
        ...sessionInput,
        ...billingInput,
        
      ],
    },
    {
      category: "Frequency Settings",
      fields: [
        {
          id: "frequency",
          name: "frequency",
          label: "Frequency",
          type: "select",
          options: [
            { value: ReminderFrequency.ONCE, label: "Once" },
            { value: ReminderFrequency.MINUTELY, label: "Every Few Minutes" },
            { value: ReminderFrequency.HOURLY, label: "Hourly" },
            { value: ReminderFrequency.DAILY, label: "Daily" },
            { value: ReminderFrequency.WEEKLY, label: "Weekly" },
            { value: ReminderFrequency.MONTHLY, label: "Monthly" },
          ],
          required: true,
        },

        {
          id: "frequencyConfig.selectedDays",
          name: "frequencyConfig.selectedDays",
          label: "Select Days of Week",
          type: "multiSelect",
          valueType: 'number',
          options: [
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
            { value: "2", label: "Tuesday" },
            { value: "3", label: "Wednesday" },
            { value: "4", label: "Thursday" },
            { value: "5", label: "Friday" },
            { value: "6", label: "Saturday" },
            
          ],
          placeholder: "Select days of the week...",
          required: true,
        },
        {
          id: "frequencyConfig.selectedDates",
          name: "frequencyConfig.selectedDates",
          label: "Select Dates of Month",
          type: "multiSelect",
          valueType: 'number',
          options: Array.from({ length: 31 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `${i + 1}${getOrdinalSuffix(i + 1)}`
          })),
          placeholder: "Select dates of the month (1-31)...",
          required: true,
        }, {
          id: "frequencyConfig.selectedHours",
          name: "frequencyConfig.selectedHours",
          label: "Select Hours",
          type: "multiSelect",
          valueType: 'number',
          options: Array.from({ length: 24 }, (_, i) => ({
            value: i.toString(),
            label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`
          })),
          placeholder: "Select hours of the day...",
          required: true,
        }, {
          id: "frequencyConfig.selectedMinutes",
          name: "frequencyConfig.selectedMinutes",
          label: "Select Minutes",
          type: "multiSelect",
          valueType: 'number',
          options: [
            { value: "0", label: "On the hour (:00)" },
            { value: "15", label: "Quarter past (:15)" },
            { value: "30", label: "Half past (:30)" },
            { value: "45", label: "Quarter to (:45)" },
          ],
          placeholder: "Select minute intervals...",
          required: true,
        }, {
          id: "frequencyConfig.time",
          name: "frequencyConfig.time",
          label: "Time of Day",
          type: "time",
          placeholder: "09:00",
          required: true,
        },

        {
          id: "isRecurring",
          name: "isRecurring",
          label: "Recurring Reminder",
          type: "switch",
          required: false,
        }],
    },
    {
      category: "Delivery & Priority",
      fields: [
        {
          id: "actions",
          name: "actions",
          label: "Actions",
          type: "multiSelect",
          options: [
            { value: ReminderActions.EMAIL, label: "Email" },
            { value: ReminderActions.BILLING, label: "BILLING" },
          ],
          required: true,
        },
        {
          id: "priority",
          name: "priority",
          label: "Priority Level",
          type: "select",
          valueType: "number",
          options: [
            { value: "1", label: "Low (1)" },
            { value: "2", label: "Normal (2)" },
            { value: "3", label: "High (3)" },
            { value: "4", label: "Urgent (4)" },
            { value: "5", label: "Critical (5)" },
          ],
          required: false,
        },
      ],
    },
    {
      category: "Retry Settings",
      fields: [
        {
          id: "maxAttempts",
          name: "maxAttempts",
          label: "Max Retry Attempts",
          type: "number",
          placeholder: "3",
          min: 1,
          max: 10,
          valueType: "number",
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
      ],
    },
  ];


  const fields = categorizedFields.flatMap((section) => section.fields);

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
        {isEditing ? "Update Reminder" : "Create Reminder"}
      </Button>
    </div>
  );


  const categorizedContent = categorizedFields.reduce(
    (acc, { category, fields }) => {
      const fieldInputs = inputs.slice(acc.inputIndex, acc.inputIndex + fields.length);
      acc.inputIndex += fields.length;

      acc.sections.push(
        <div key={category}>
          <h3 className="text-sm font-normal mb-2">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldInputs}
          </div>
        </div>
      );

      return acc;
    },
    { inputIndex: 0, sections: [] as JSX.Element[] }
  ).sections;

  return (
    <ModalForm<TReminderData, IReminder>
      title={`${isEditing ? "Edit" : "Create"} Reminder`}
      description={`${isEditing ? "Edit existing" : "Create a new"} reminder with custom frequency settings`}
      open={isEditing || isCreating}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-6">
        {categorizedContent}
      </div>
    </ModalForm>
  );
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}