// External Libraries
import { z } from "zod";

// Types
import { IReminder, TReminderData } from "@/@types/reminder.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { ReminderType, ReminderFrequency, ReminderActions } from "#/modules/v1/reminders/enums/reminder.enum";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import ReminderFormModal from "@/components/admin/reminders/form/reminder-form-modal";
import { ReminderTable } from "@/components/admin";

// API
import { createReminder, deleteReminder, fetchReminder, fetchReminders, updateReminder } from "@/services/reminder.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Layouts
import { PageInnerLayout } from "@/layouts";

// Schema
export const ReminderSchema = z.object({
    type: z.nativeEnum(ReminderType),
    message: z.string().min(5, "Message must be at least 5 characters"),
    scheduledAt: z.date().min(new Date(), "Scheduled date must be in the future"),
    frequency: z.nativeEnum(ReminderFrequency),
    endDate: z.date().optional(),
    actions: z
        .array(z.nativeEnum(ReminderActions))
        .min(1, "At least one delivery method is required"),
    recipientId: z.number().min(1, "Recipient ID must be a positive number"),
    sessionId: z.number().min(0, "Session ID must be a non-negative number").optional(),
    billingId: z.number().min(0, "Billing ID must be a non-negative number").optional(),
    priority: z.number().min(1).max(5).optional(),
    maxAttempts: z.number().min(1).max(10).optional(),
    retryInterval: z.number().min(1).optional(),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.number().min(1).optional(),
    timeOfDay: z.string().optional(),
    intervalMinutes: z.number().min(1).optional(),
});

export default function RemindersPage() {

    const REMINDER_INITIAL_VALUES: TDefaultValue<TReminderData> = {
        type: { value: ReminderType.CUSTOM },
        message: { value: "" },
        scheduledAt: { value: new Date() },
        frequency: { value: ReminderFrequency.ONCE },
        endDate: { value: undefined },
        actions: { value: [ReminderActions.EMAIL] },
        priority: { value: 2 },
        maxAttempts: { value: 3 },
        retryInterval: { value: 1440 },
        isRecurring: { value: false },
        recurringInterval: { value: 7 },
        timeOfDay: { value: "09:00" },
        intervalMinutes: { value: 30 },
        recipientId: { value: 0 },
        sessionId: { value: 0 },
        billingId: { value: 0 }
    };

    return (
        <PageInnerLayout Header={<Header />}>
            <ListHandler<IReminder, Partial<TReminderData>, IReminder | IMessageResponse>
                queryListFn={fetchReminders}
                ListComponent={ReminderTable}
                storeKey="remindersList"
                mutationFns={{
                    createFn: createReminder,
                    updateFn: updateReminder,
                    deleteFn: deleteReminder
                }}
                queryFn={fetchReminder}
                FormComponent={ReminderFormModal}
                validationSchema={ReminderSchema}
                initialValues={REMINDER_INITIAL_VALUES}
                validationMode={EVALIDATION_MODES.OnChange}
            />
        </PageInnerLayout>
    );
}

const Header = () => null
