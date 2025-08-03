// External Libraries
import { z } from "zod";

// Types
import { IUserAvailability, TUpdateUserAvailabilityData } from "@/@types/user.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { AvailabilityCardForm } from "@/components/admin/settings";

// API
import { fetchMyAvailability, updateMyAvailability } from "@/services/user.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

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

export default function AvailabilityPage() {
    const AVAILABILITY_INITIAL_VALUES: TDefaultValue<Partial<TUpdateUserAvailabilityData>> = {
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

    return (<SingleHandler<IUserAvailability, TUpdateUserAvailabilityData, IMessageResponse>
        queryFn={fetchMyAvailability}
        storeKey="availabilitySettings"
        initialValues={AVAILABILITY_INITIAL_VALUES}
        FormComponent={AvailabilityCardForm}
        id={1}
        validationSchema={AvailabilitySchema}
        mutationFns={{
            updateFn: (id: number) => updateMyAvailability
        }}
        validationMode={EVALIDATION_MODES.OnChange}
        useManualForm={true}
    />);
}
