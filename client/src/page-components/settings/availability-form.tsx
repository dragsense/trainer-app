
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { IUserAvailability } from "@shared/interfaces/user.interface";
import { TUpdateUserAvailabilityData } from "@shared/types/user.type";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { AvailabilityCardForm } from "@/components/admin";

// Services
import { updateMyAvailability } from "@/services/user.api";
import { DAYS_OF_WEEK } from "@/components/admin/settings/form/availability-card-form";
import { useMemo } from "react";
import { extractValues } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";

// UI Components
import { Badge } from "@/components/ui/badge";

// DTOs
import { UpdateUserAvailabilityDto } from "@shared/dtos/user-dtos/user-availability.dto";





interface IAvailabilityProps extends THandlerComponentProps<TSingleHandlerStore<IUserAvailability, any>> {
}


interface IAvailabilityExtraProps {
}

export default function Availability({
    storeKey,
    store
}: IAvailabilityProps) {

    const queryClient = useQueryClient();


    const INITIAL_VALUES: TDefaultValue<TUpdateUserAvailabilityData> = {
        weeklySchedule: {
            value: {
                monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
                tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
                wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
                thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
                friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
                saturday: { enabled: false, timeSlots: [] },
                sunday: { enabled: false, timeSlots: [] },
            }
        },
        unavailablePeriods: { value: [] },
    };


    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: availability, isLoading } = store(useShallow(state => ({
        response: state.response,
        isLoading: state.isLoading,
    })));

    
    const initialValues = useMemo(() => {
        return extractValues(availability, INITIAL_VALUES);
    }, [availability]);



    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }



    if (!availability)
        return <div>Availability not found</div>

    const weeklySchedule = availability.weeklySchedule || {} as any;





    return <>

        {/* Current Status Section */}
        {availability && (
            <div className="space-y-4 mb-4 pt-4">
                <h3 className="text-lg font-semibold">Current Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Last Updated</label>
                        <p className="font-medium">
                            {new Date(availability.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Working Days</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {DAYS_OF_WEEK.map(({ key, label }) => (
                                <Badge
                                    key={key}
                                    variant={weeklySchedule[key]?.enabled ? 'default' : 'secondary'}
                                    className="text-xs"
                                >
                                    {label.slice(0, 3)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <FormHandler<TUpdateUserAvailabilityData, IMessageResponse, IAvailabilityExtraProps>
            mutationFn={updateMyAvailability}
            FormComponent={AvailabilityCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={UpdateUserAvailabilityDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-single"] });
            }}
        />



    </>

}
