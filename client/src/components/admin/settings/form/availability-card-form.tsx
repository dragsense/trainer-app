import { ReactNode, useState, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { Plus, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

// UI Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TDayKey, TUpdateUserAvailabilityData } from "@/@types/user.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";

export const DAYS_OF_WEEK: { key: TDayKey; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

const MAX_SLOTS = 5;
const MAX_UNAVAILABLE = 5;

interface IAvailabilityCardFormProps {
    storeKey: string;
}

export default function AvailabilityCardForm({ storeKey }: IAvailabilityCardFormProps) {

    const { getValues, setValue } = useFormContext();

    const formStoreKey = storeKey + "-form";
    const formStore = useRegisteredStore<TFormHandlerStore<TUpdateUserAvailabilityData, IMessageResponse>>(formStoreKey);

    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { values, isSubmitting } = formStore(useShallow(state => ({
        values: state.values,
        isSubmitting: state.isSubmitting,
    })));

    const weeklySchedule = values.weeklySchedule || {} as Record<TDayKey, any>;
    const unavailablePeriods = values.unavailablePeriods || [];


    const [timeSlotCounts, setTimeSlotCounts] = useState<Record<TDayKey, number>>(
        DAYS_OF_WEEK.reduce((acc, day) => {
            acc[day.key] = weeklySchedule[day.key]?.timeSlots?.length ?? 1;
            return acc;
        }, {} as Record<TDayKey, number>)
    );

        console.log('Weekly schedule:', timeSlotCounts);

    const [unavailableCount, setUnavailableCount] = useState(unavailablePeriods?.length || 1);

    const dynamicFields = useMemo(() => {
        const fields: TFieldConfig[] = [];

        DAYS_OF_WEEK.forEach((day) => {
            fields.push({
                id: `${day.key}.enabled`,
                name: `weeklySchedule.${day.key}.enabled`,
                label: `${day.label} Available`,
                type: "switch",
                required: true
            });

            for (let i = 0; i < timeSlotCounts[day.key]; i++) {
                fields.push({
                    id: `${day.key}.timeSlots[${i}].start`,
                    name: `weeklySchedule.${day.key}.timeSlots[${i}].start`,
                    label: `Start Time #${i + 1}`,
                    type: "time",
                    required: true,
                    disabled: ({ values }) => !values.weeklySchedule[day.key].enabled
                });
                fields.push({
                    id: `${day.key}.timeSlots[${i}].end`,
                    name: `weeklySchedule.${day.key}.timeSlots[${i}].end`,
                    label: `End Time #${i + 1}`,
                    type: "time",
                    required: true,
                    disabled: ({ values }) => !values.weeklySchedule[day.key].enabled
                });
            }
        });

        for (let i = 0; i < unavailableCount; i++) {
            fields.push({
                id: `unavailablePeriods[${i}].startDate`,
                name: `unavailablePeriods[${i}].startDate`,
                label: `Start Date`,
                type: "date",
                required: true,
            });
            fields.push({
                id: `unavailablePeriods[${i}].endDate`,
                name: `unavailablePeriods[${i}].endDate`,
                label: `End Date`,
                type: "date",
                required: true,
            });
            fields.push({
                id: `unavailablePeriods[${i}].reason`,
                name: `unavailablePeriods[${i}].reason`,
                label: `Reason`,
                type: "text",
                required: true,
            });
        }

        return fields;
    }, [timeSlotCounts, unavailableCount]);

    const { inputs } = useInput({
        fields: dynamicFields,
        showRequiredAsterisk: true,
    });

    const addTimeSlot = (dayKey: TDayKey) => {


        const currentSlots = getValues(`weeklySchedule.${dayKey}.timeSlots`) || [];
        const newSlots = [...currentSlots, { start: '', end: '' }];
        setValue(`weeklySchedule.${dayKey}.timeSlots`, newSlots);
        const newSlotCount = newSlots.length;

        setTimeSlotCounts((prev) => ({
            ...prev,
            [dayKey]: Math.min(MAX_SLOTS, newSlotCount),
        }));
    };

    const removeTimeSlot = (dayKey: TDayKey, index: number) => {

        const currentSlots = getValues(`weeklySchedule.${dayKey}.timeSlots`) || [];
        const newSlots = currentSlots.filter((_: any, i: number) => i !== index);
        setValue(`weeklySchedule.${dayKey}.timeSlots`, newSlots.length ? newSlots : [{ start: '', end: '' }]);
        const newSlotCount = newSlots.length;

        setTimeSlotCounts((prev) => ({
            ...prev,
            [dayKey]: Math.max(1, newSlotCount),
        }));
    };

    const addUnavailablePeriod = () => {
        setUnavailableCount((prev) => Math.min(MAX_UNAVAILABLE, prev + 1));
    };

    const removeUnavailablePeriod = (index: number) => {
        setUnavailableCount((prev) => Math.max(1, prev - 1));
    };

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>


        </div>
    );

    return (
        <CardForm
            title="Update Availability"
            description="Set your weekly schedule and unavailable periods"
            footerContent={footerContent}
            formStore={formStore}
        >
            <div className="space-y-8">
                {DAYS_OF_WEEK.map((day) => {
                    return (
                        <div key={day.key} className="border p-4 rounded-md">
                            <h4 className="font-medium mb-2">{day.label}</h4>
                            {inputs.find((i) => i.props.name === `weeklySchedule.${day.key}.enabled`)}

                           
                                <>
                                    {Array.from({ length: timeSlotCounts[day.key] }).map((_, idx) => (
                                        <div key={idx} className="grid grid-cols-3 gap-2 items-end mt-2">
                                            {inputs.find(
                                                (i) =>
                                                    i.props.name ===
                                                    `weeklySchedule.${day.key}.timeSlots[${idx}].start`
                                            )}
                                            {inputs.find(
                                                (i) =>
                                                    i.props.name ===
                                                    `weeklySchedule.${day.key}.timeSlots[${idx}].end`
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTimeSlot(day.key, idx)}
                                                disabled={timeSlotCounts[day.key] === 1}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => addTimeSlot(day.key)}
                                        disabled={timeSlotCounts[day.key] >= MAX_SLOTS}
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Time Slot
                                    </Button>
                                </>
                           
                        </div>
                    );
                })}

                <div className="border p-4 rounded-md">
                    <h4 className="font-medium mb-2">Unavailable Periods</h4>
                    {Array.from({ length: unavailableCount }).map((_, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end mt-2">
                            {inputs.find((i) => i.props.name === `unavailablePeriods[${idx}].startDate`)}
                            {inputs.find((i) => i.props.name === `unavailablePeriods[${idx}].endDate`)}
                            {inputs.find((i) => i.props.name === `unavailablePeriods[${idx}].reason`)}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeUnavailablePeriod(idx)}
                                disabled={unavailableCount === 1}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addUnavailablePeriod}
                        disabled={unavailableCount >= MAX_UNAVAILABLE}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Period
                    </Button>
                </div>
            </div>
        </CardForm>
    );
}