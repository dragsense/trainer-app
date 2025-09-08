
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IReminder, TReminderData } from "@/@types/reminder.type";
import { ReminderActions, ReminderFrequency, ReminderType } from "#/modules/v1/reminders/enums/reminder.enum";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { ReminderFormModal } from "@/components/admin";

// Services
import { createReminder, updateReminder } from "@/services/reminder.api";


export const ReminderSchema = z
    .object({
        type: z.nativeEnum(ReminderType),
        message: z.string().min(5, "Message must be at least 5 characters"),
        title: z.string().min(5, "Message must be at least 5 characters"),
        scheduledAt: z.date().min(new Date(), "Scheduled date must be in the future"),
        frequencyConfig: z.object({
            frequency: z.nativeEnum(ReminderFrequency),
            timeOfDay: z.string().optional(),
            intervalMinutes: z
                .number()
                .min(5, "Minimum interval is 5 minutes")
                .optional(),
            weekdays: z.array(z.number()).optional(),
            monthDays: z.array(z.number()).optional(),
        }),
        actions: z.array(z.nativeEnum(ReminderActions)).min(1, "At least one delivery method is required"),
        recipientId: z.number().optional(),
        sessionId: z.number().optional(),
        billingId: z.number().optional(),
        priority: z.number().min(1).max(5).optional(),
        maxAttempts: z.number().min(1).max(10).optional(),
        retryInterval: z.number().min(1).optional(),
        isRecurring: z.boolean().default(false),
        recurringInterval: z.number().min(1).optional(),
        endDate: z.date().optional(),
    })
    .superRefine((data, ctx) => {
        const { frequencyConfig } = data;
        const { frequency, timeOfDay, intervalMinutes, weekdays, monthDays } = frequencyConfig;

        if (frequency !== ReminderFrequency.ONCE) {
            if (!timeOfDay && !intervalMinutes) {
                ctx.addIssue({
                    path: ["frequencyConfig", "timeOfDay"],
                    code: z.ZodIssueCode.custom,
                    message: "Select either a time of day or an interval for reminders",
                });
            }
        }

        if (frequency === ReminderFrequency.WEEKLY) {
            if (!weekdays || weekdays.length === 0) {
                ctx.addIssue({
                    path: ["frequencyConfig", "weekdays"],
                    code: z.ZodIssueCode.custom,
                    message: "Select at least one day of the week",
                });
            }
        }

        if (frequency === ReminderFrequency.MONTHLY) {
            if (!monthDays || monthDays.length === 0) {
                ctx.addIssue({
                    path: ["frequencyConfig", "monthDays"],
                    code: z.ZodIssueCode.custom,
                    message: "Select at least one date of the month",
                });
            }

        }
    });

interface IReminderFormProps extends TActionComponentProps<any> {
}


interface IReminderFormExtraProps {
    open: boolean,
    onClose: () => void,
    isEditing?: boolean
}

export default function ReminderForm({
    storeKey
}: IReminderFormProps) {

    const queryReminder = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TReminderData> = {
        type: { value: ReminderType.CUSTOM },
        message: { value: "" },
        title: { value: "" },

        scheduledAt: { value: new Date() },
        frequencyConfig: {
            value: {
                frequency: ReminderFrequency.ONCE,
                intervalMinutes: 30,
                weekdays: [],
                monthDays: []
            }
        },
        endDate: { value: undefined },
        actions: { value: [ReminderActions.EMAIL] },
        priority: { value: 2 },
        maxAttempts: { value: 3 },
        retryInterval: { value: 1440 },
        isRecurring: { value: false },
        recurringInterval: { value: 7 },
        recipientId: { value: 0 },
        sessionId: { value: 0 },
        billingId: { value: 0 }
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IReminder>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, reset } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset
    })));

    const isEditing = !!response;

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            ...(response || {}),
            ...(response?.recipient ? { recipientId: response.recipient.id } : {}),
            ...(response?.session ? { sessionId: response.session.id } : {}),
            ...(response?.billing ? { sessionId: response.billing.id } : {}),


        };


        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (flatResponse as any)[key];
                    return [
                        key,
                        {
                            ...original,
                            value: newValue !== undefined ? newValue : original.value,
                        },
                    ];
                })
            ),

        };


        return updatedValues;
    };

    const initialValues = getInitialValues();

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }



    return <>
        <FormHandler<TReminderData, IMessageResponse, IReminderFormExtraProps>
            mutationFn={isEditing ? updateReminder(response.id) : createReminder}
            FormComponent={ReminderFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={ReminderSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryReminder.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                open: !!action,
                onClose: reset,
                isEditing,
            }}
        />

    </>

}
