
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import {  THandlerComponentProps } from "@/@types/handler-types";
import { TReminderData } from "@shared/types/reminder.type";
import { IReminder } from "@shared/interfaces/reminder.interface";
import { EReminderActions, EReminderFrequency, EReminderType } from "@shared/enums/reminder.enum";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { ReminderFormModal } from "@/components/admin";

// Services
import { createReminder, updateReminder } from "@/services/reminder.api";
import { IReminderFormExtraProps } from "@/components/admin/reminders/form/reminder-form-modal";
import { useMemo } from "react";
import { extractValues } from "@/utils";
import { CreateReminderDto } from "@shared/dtos";



interface IReminderFormProps extends THandlerComponentProps<TSingleHandlerStore<IReminder, any>> {
}


export default function ReminderForm({
    storeKey,
    store
}: IReminderFormProps) {

    const queryReminder = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TReminderData> = {
        type: { value: EReminderType.CUSTOM },
        message: { value: "" },
        title: { value: "" },

        scheduledAt: { value: new Date() },
        frequencyConfig: {
            isNested: true, 
            value: {
                frequency: { value: EReminderFrequency.ONCE },
                intervalMinutes: { value: 30 },
                weekdays: { value: [] },
                monthDays: { value: [] }
            }
        },
        endDate: { value: undefined },
        actions: { value: [EReminderActions.EMAIL] },
        priority: { value: 2 },
        maxAttempts: { value: 3 },
        retryInterval: { value: 1440 },
        isRecurring: { value: false },
        recurringInterval: { value: 7 },
        recipientId: { value: 0 },
        sessionId: { value: 0 },
        billingId: { value: 0 }
    };


    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, reset, setAction } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset,
        setAction: state.setAction
    })));

   const initialValues = useMemo(() => {
        return extractValues(response, INITIAL_VALUES);
    }, [response]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }


    const handleClose = () => {
        setAction('none');
    };


    return <>
        <FormHandler<TReminderData, IMessageResponse, IReminderFormExtraProps>
            mutationFn={response?.id ? updateReminder(response.id) : createReminder}
            FormComponent={ReminderFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={CreateReminderDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryReminder.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                    open: action === 'createOrUpdate',
                    onClose: handleClose,
                    isEditing: response?.id ? true : false,
            }}
        />

    </>

}
