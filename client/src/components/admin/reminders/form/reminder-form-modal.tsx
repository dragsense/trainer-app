// External Libraries
import React, { JSX, useState } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableBillings, useSearchableSessions, useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IReminder, TReminderData } from "@/@types/reminder.type";
import { ReminderType, ReminderFrequency, ReminderActions } from "#/modules/v1/reminders/enums/reminder.enum";
import { IBilling } from "@/@types/billing.type";
import { IUser } from "@/@types/user.type";
import { ISession } from "@/@types/session.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Stores
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { FormErrors } from "@/components/shared-ui/form-errors";

export interface IReminderFormModalProps {
  storeKey: string;
  open: boolean;
  isEditing?: boolean;
  onClose: () => void;
}

export default function ReminderFormModal({
  storeKey,
  open,
  isEditing = false,
  onClose,
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

  const isSubmitting = formStore(state => state.isSubmitting);


  // Base fields
  const categorizedFields: { category: string; fields: TFieldConfig[] }[] = [
    {
      category: "",
      fields: [{
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
      }]

    },

    {

      category: "Basic Information",
      fields: [
        {
          id: "title",
          name: "title",
          label: "Title",
          type: "text",
          placeholder: "Enter reminder title...",
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
        {
          id: "recipientId",
          name: "recipientId",
          label: "Recipient",
          placeholder: "Select Recipient",
          type: "custom",
          valueType: "number",
          visible: ({ values }) => values.type === ReminderType.CUSTOM,
          required: ({ values }) => values.type === ReminderType.CUSTOM,
          Component: (props) => (
            <SearchableInputWrapper<IUser>
              {...props}
              modal={true}

              useSearchable={() => useSearchableUsers({})}
              getLabel={(item) => item.email}
              getKey={(item) => item.id.toString()}
              shouldFilter={false}
            />

          ),
        },
        {
          id: "sessionId",
          name: "sessionId",
          label: "Session",
          placeholder: "Select Session",
          type: "custom",
          valueType: "number",
          visible: ({ values }) => values.type === ReminderType.SESSION,
          required: ({ values }) => values.type === ReminderType.SESSION,
          Component: (props) => (
            <SearchableInputWrapper<ISession>
              {...props}
              modal={true}
              useSearchable={() => useSearchableSessions({})}
              getLabel={(item) => item.title}
              getKey={(item) => item.id.toString()}
              shouldFilter={false}
            />

          ),
        },
        {
          id: "billingId",
          name: "billingId",
          label: "Billing",
          placeholder: "Select Billing",
          type: "custom",
          visible: ({ values }) => values.type === ReminderType.BILLING,
          required: ({ values }) => values.type === ReminderType.BILLING,
          valueType: "number",
          Component: (props) => (
            <SearchableInputWrapper<IBilling>
              {...props}
              modal={true}
              useSearchable={() => useSearchableBillings({})}
              getLabel={(item) => item.localInvoiceNumber}
              getKey={(item) => item.id.toString()}
              shouldFilter={false}
            />

          ),
        },

      ],
    },
    {
      category: "Frequency Settings",
      fields: [
        {
          id: "frequencyConfig.frequency",
          name: "frequencyConfig.frequency",
          label: "Frequency",
          type: "select",
          options: [
            { value: ReminderFrequency.ONCE, label: "Once" },
            { value: ReminderFrequency.DAILY, label: "Daily" },
            { value: ReminderFrequency.WEEKLY, label: "Weekly" },
            { value: ReminderFrequency.MONTHLY, label: "Monthly" },
          ],
          required: true,
        },
        {
          id: "frequencyConfig.timeOfDay",
          name: "frequencyConfig.timeOfDay",
          label: "Time of Day",
          type: "time",
          visible: ({ values }) =>
            values.frequencyConfig.frequency !== ReminderFrequency.ONCE,
          required: ({ values }) =>
            values.frequencyConfig.frequency !== ReminderFrequency.ONCE
        },
        {
          id: "frequencyConfig.intervalMinutes",
          name: "frequencyConfig.intervalMinutes",
          label: "Repeat Every",
          type: "select",
          valueType: "number",
          options: [
            5, 10, 20, 30, 45,
            ...Array.from({ length: (5 - 1) * 2 + 1 }, (_, i) => 60 + i * 30),
            ...Array.from({ length: 12 - 5 }, (_, i) => (i + 6) * 60)
          ].map(v => ({
            value: v.toString(),
            label:
              v < 60
                ? `${v} min`
                : v % 60 === 0
                  ? `${v / 60} hour${v / 60 > 1 ? "s" : ""}`
                  : `${Math.floor(v / 60)}.5 hours`
          })),
          visible: ({ values }) =>
            values.frequencyConfig.frequency !== ReminderFrequency.ONCE,
          required: ({ values }) =>
            values.frequencyConfig.frequency !== ReminderFrequency.ONCE
        },
        {
          id: "frequencyConfig.weekdays",
          name: "frequencyConfig.weekdays",
          label: "Select Days of Week",
          type: "multiSelect",
          valueType: "number",
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
          visible: ({ values }) => values.frequencyConfig.frequency === ReminderFrequency.WEEKLY,
          required: ({ values }) => values.frequencyConfig.frequency === ReminderFrequency.WEEKLY,
        },
        {
          id: "frequencyConfig.monthDays",
          name: "frequencyConfig.monthDays",
          label: "Select Dates of Month",
          type: "multiSelect",
          valueType: "number",
          options: Array.from({ length: 31 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
          })),
          visible: ({ values }) => values.frequencyConfig.frequency === ReminderFrequency.MONTHLY,
          required: ({ values }) => values.frequencyConfig.frequency === ReminderFrequency.MONTHLY,
        },
        {
          id: "isRecurring",
          name: "isRecurring",
          label: "Recurring Reminder",
          type: "switch",
          required: false,
          visible: ({ values }) =>
            values.frequencyConfig.frequency === ReminderFrequency.ONCE,
        },
      ],
    }
    ,
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
    if (state === false) onClose();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          onClose();
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
      open={open}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-6">
        {categorizedContent}
      </div>

       <FormErrors />
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