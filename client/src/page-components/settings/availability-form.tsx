
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

// UI Components
import { Badge } from "@/components/ui/badge";

// Reusable time slot schema
const TimeSlotSchema = z.object({
    start: z.string()
        .min(5, "Must be HH:MM format")
        .max(5, "Must be HH:MM format")
        .refine(time => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours >= 0 && hours <= 23 &&
                minutes >= 0 && minutes <= 59;
        }, "Invalid time (00:00-23:59)"),
    end: z.string()
        .min(5, "Must be HH:MM format")
        .max(5, "Must be HH:MM format")
}).refine(
    slot => {
        const [startH, startM] = slot.start.split(':').map(Number);
        const [endH, endM] = slot.end.split(':').map(Number);
        return endH > startH || (endH === startH && endM > startM);
    },
    { message: "End time must be after start time", path: ["end"] }
);

// Reusable day schema
const DayScheduleSchema = z.object({
    enabled: z.boolean(),
    timeSlots: z.array(TimeSlotSchema)
});

// Reusable unavailable period schema
const UnavailablePeriodSchema = z.object({
    id: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string()
}).refine(
    period => period.endDate >= period.startDate,
    { message: "End date must be after start date", path: ["endDate"] }
);

// Schema
export const AvailabilitySchema = z.object({
    weeklySchedule: z.object({
        monday: DayScheduleSchema,
        tuesday: DayScheduleSchema,
        wednesday: DayScheduleSchema,
        thursday: DayScheduleSchema,
        friday: DayScheduleSchema,
        saturday: DayScheduleSchema,
        sunday: DayScheduleSchema
    }),
    unavailablePeriods: z.array(UnavailablePeriodSchema).optional()
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

    const { response: availability, isLoading } = singleStore(useShallow(state => ({
        response: state.response,
        isLoading: state.isLoading,
    })));

    if (!availability)
        return <div>Availability not found</div>

    const weeklySchedule = availability.weeklySchedule || {} as any;
    const unavailablePeriods = availability.unavailablePeriods || [];


    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!availability) {
            return INITIAL_VALUES;
        }

        // Ensure weeklySchedule has all days with proper structure
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        const formattedWeeklySchedule = {} as any;

        days.forEach(day => {
            formattedWeeklySchedule[day] = {
                enabled: weeklySchedule[day]?.enabled ?? false,
                timeSlots: weeklySchedule[day]?.timeSlots || []
            };
        });

        // Ensure unavailablePeriods is an array with proper structure
        const formattedUnavailablePeriods = (unavailablePeriods || []).map(period => ({
            id: period.id || undefined,
            startDate: period.startDate ? new Date(period.startDate) : new Date(),
            endDate: period.endDate ? new Date(period.endDate) : new Date(),
            reason: period.reason || ''
        }));

        return {
            weeklySchedule: {
                value: formattedWeeklySchedule
            },
            unavailablePeriods: {
                value: formattedUnavailablePeriods
            }
        };
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
            validationSchema={AvailabilitySchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
        />



    </>

}
