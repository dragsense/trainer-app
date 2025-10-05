
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TReminderData } from "@shared/types/reminder.type";
import { IReminder } from "@shared/interfaces/reminder.interface";
import { EReminderActions, EReminderFrequency, EReminderType } from "@shared/enums/reminder.enum";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { ReminderFormModal } from "@/components/admin";
import { IReminderFormExtraProps } from "@/components/admin/reminders/form/reminder-form-modal";

// Services
import { createReminder, updateReminder } from "@/services/reminder.api";
import { strictDeepMerge } from "@/utils";
import { CreateReminderDto, UpdateReminderDto } from "@shared/dtos";



interface IReminderFormProps extends THandlerComponentProps<TSingleHandlerStore<IReminder, IReminderFormExtraProps>> {
}

export default function ReminderForm({
    storeKey,
    store,
}: IReminderFormProps) {

    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, reset } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        reset: state.reset
    })));

    const INITIAL_VALUES: TReminderData = {
        type: EReminderType.CUSTOM,
        title: "",
        message: "",
        scheduledAt: new Date(),
        endDate: undefined,
        frequencyConfig: {
            frequency: EReminderFrequency.ONCE,
            timeOfDay: undefined,
            intervalMinutes: 30,
            weekdays: [],
            monthDays: []
        },
        actions: [EReminderActions.EMAIL],
        priority: 2,
        maxAttempts: 3,
        retryInterval: 1440,
        isRecurring: false,
        recurringInterval: 7,
        recipientId: 0,
        sessionId: 0,
        billingId: 0
    };

    const initialValues = strictDeepMerge<TReminderData>(INITIAL_VALUES, response ?? {});

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleClose = () => {
        reset();
        setAction('none');
    };

    const isEditing = !!response?.id;
    const mutationFn = isEditing ? updateReminder(response.id) : createReminder;
    const dto = isEditing ? UpdateReminderDto : CreateReminderDto;

    return <>
        <FormHandler<TReminderData, IMessageResponse, IReminderFormExtraProps>
            mutationFn={mutationFn}
            FormComponent={ReminderFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
            }}
        />
    </>
}
