// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";

// Hooks
// (no hooks needed for this component)

// Types
import { IUserAvailability, TUpdateUserAvailabilityData } from "@/@types/user.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { useStore } from "zustand";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IAvailabilityCardFormProps {
    storeKey: string;
}

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
] as const;

export default function AvailabilityCardForm({ storeKey }: IAvailabilityCardFormProps) {
    const formStoreKey = storeKey + "-form";
    const singleStoreKey = storeKey + "-single";

    // Move store calls to top level - this fixes the hook rendering issue
    const formStore = useRegisteredStore<TFormHandlerStore<TUpdateUserAvailabilityData, IMessageResponse>>(formStoreKey);
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUserAvailability>>(singleStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { isSubmitting, values, setValues } = useStore(formStore);
    const { response: availability } = useStore(singleStore);

    const weeklySchedule = values.weeklySchedule || {} as any;
    const unavailablePeriods = values.unavailablePeriods || [];

    const updateDaySchedule = (day: string, updates: any) => {
        const currentSchedule = values.weeklySchedule || {} as any;
        setValues({
            ...values,
            weeklySchedule: {
                ...currentSchedule,
                [day]: {
                    ...currentSchedule[day],
                    ...updates,
                },
            },
        });
    };

    const addTimeSlot = (day: string) => {
        const currentSchedule = values.weeklySchedule || {} as any;
        const daySchedule = currentSchedule[day] || { enabled: true, timeSlots: [] };
        const newTimeSlot = { start: '09:00', end: '17:00' };

        updateDaySchedule(day, {
            timeSlots: [...daySchedule.timeSlots, newTimeSlot],
        });
    };

    const updateTimeSlot = (day: string, index: number, updates: any) => {
        const currentSchedule = values.weeklySchedule || {} as any;
        const daySchedule = currentSchedule[day] || { enabled: true, timeSlots: [] };
        const updatedTimeSlots = daySchedule.timeSlots.map((slot: any, i: number) =>
            i === index ? { ...slot, ...updates } : slot
        );
        updateDaySchedule(day, { timeSlots: updatedTimeSlots });
    };

    const removeTimeSlot = (day: string, index: number) => {
        const currentSchedule = values.weeklySchedule || {} as any;
        const daySchedule = currentSchedule[day] || { enabled: true, timeSlots: [] };
        const updatedTimeSlots = daySchedule.timeSlots.filter((_: any, i: number) => i !== index);
        updateDaySchedule(day, { timeSlots: updatedTimeSlots });
    };

    const addUnavailablePeriod = () => {
        const currentPeriods = values.unavailablePeriods || [];
        const newPeriod = {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            reason: 'Personal',
        };
        setValues({
            ...values,
            unavailablePeriods: [...currentPeriods, newPeriod],
        });
    };

    const updateUnavailablePeriod = (index: number, updates: any) => {
        const currentPeriods = values.unavailablePeriods || [];
        const updatedPeriods = currentPeriods.map((period: any, i: number) =>
            i === index ? { ...period, ...updates } : period
        );
        setValues({
            ...values,
            unavailablePeriods: updatedPeriods,
        });
    };

    const removeUnavailablePeriod = (index: number) => {
        const currentPeriods = values.unavailablePeriods || [];
        const updatedPeriods = currentPeriods.filter((_: any, i: number) => i !== index);
        setValues({
            ...values,
            unavailablePeriods: updatedPeriods,
        });
    };

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Availability Settings"
            description="Manage your weekly schedule and unavailable periods"
            footerContent={footerContent}
            formStore={formStore}
        >
            <input type="text" id="weeklySchedule" name="weeklySchedule" />
            <input type="text" id="unavailablePeriods" name="unavailablePeriods" />

            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Weekly Schedule</h3>

                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Set your available hours for each day of the week
                    </p>

                    <div className="space-y-4">
                        {DAYS_OF_WEEK.map(({ key, label }) => {
                            const daySchedule = weeklySchedule[key] || { enabled: false, timeSlots: [] };

                            return (
                                <div key={key} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-medium">{label}</Label>
                                        <Switch
                                            checked={daySchedule.enabled}
                                            onCheckedChange={(enabled) => updateDaySchedule(key, { enabled })}
                                        />
                                    </div>

                                    {daySchedule.enabled && (
                                        <div className="space-y-2">
                                            {daySchedule.timeSlots?.map((slot: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={(e) => updateTimeSlot(key, index, { start: e.target.value })}
                                                        className="w-32"
                                                    />
                                                    <span className="text-muted-foreground">to</span>
                                                    <Input
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={(e) => updateTimeSlot(key, index, { end: e.target.value })}
                                                        className="w-32"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeTimeSlot(key, index)}
                                                        disabled={daySchedule.timeSlots.length === 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addTimeSlot(key)}
                                                className="mt-2"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Time Slot
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Unavailable Periods Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarDays className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Unavailable Periods</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Block out specific dates when you're not available
                    </p>

                    <div className="space-y-4">
                        {unavailablePeriods.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No unavailable periods set
                            </p>
                        ) : (
                            unavailablePeriods.map((period: any, index: number) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <div>
                                                <Label>Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={period.startDate}
                                                    onChange={(e) => updateUnavailablePeriod(index, { startDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>End Date</Label>
                                                <Input
                                                    type="date"
                                                    value={period.endDate}
                                                    onChange={(e) => updateUnavailablePeriod(index, { endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeUnavailablePeriod(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div>
                                        <Label>Reason</Label>
                                        <Input
                                            placeholder="e.g., Vacation, Conference, etc."
                                            value={period.reason || ''}
                                            onChange={(e) => updateUnavailablePeriod(index, { reason: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            ))
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addUnavailablePeriod}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Unavailable Period
                        </Button>
                    </div>
                </div>

                {/* Current Status Section */}
                {availability && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Current Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-muted-foreground">Last Updated</Label>
                                <p className="font-medium">
                                    {new Date(availability.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm text-muted-foreground">Working Days</Label>
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
            </div>
        </CardForm>
    );
}
