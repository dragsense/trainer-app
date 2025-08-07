
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IUserAvailability, TUpdateUserAvailabilityData } from "@/@types/user.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { AvailabilityCardForm } from "@/components/admin";

// Services
import { updateMyAvailability } from "@/services/user.api";
import { DAYS_OF_WEEK } from "@/components/admin/settings/form/availability-card-form";
import { Badge } from "@/components/ui/badge";




// Schema
export const AvailabilitySchema = z.object({
    weeklySchedule: z.object({
        monday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        tuesday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        wednesday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        thursday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        friday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        saturday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
        sunday: z.object({
            enabled: z.boolean(),
            timeSlots: z.array(z.object({
                start: z.string(),
                end: z.string(),
            })),
        }),
    }),
    unavailablePeriods: z.array(z.object({
        id: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string(),
    })).optional(),
});


interface IAvailabilityProps extends TActionComponentProps<any> {
}


interface IAvailabilityExtraProps {
}

export default function Availability({
    storeKey
}: IAvailabilityProps) {


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

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUserAvailability>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response: availability, isLoading, reset } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset
    })));

    if (!availability)
        return <div>Availability not found</div>

    const weeklySchedule = availability.weeklySchedule || {} as any;
    const unavailablePeriods = availability.unavailablePeriods || [];


    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!availability) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            weeklySchedule,
            unavailablePeriods
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

        {/* Current Status Section */}
        {availability && (
            <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold">Current Status</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Last Updated</label>
                        <p className="font-medium">
                            {new Date(availability.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Working Days</label>
                        <div className="flex gap-1 mt-1">
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
            validationSchema={AvailabilitySchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            useManualForm={true}
        
        />



    </>

}
