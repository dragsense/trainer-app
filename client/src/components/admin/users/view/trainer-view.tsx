// External Libraries
import { ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, Mail, Phone, MapPin, Star, Calendar, Target } from "lucide-react";

// Types
import { IUser } from "@/@types/user.type";

// Stores
import { TSingleHandlerStore } from "@/stores";

interface ITrainerViewProps {
    storeKey: string;
    store: TSingleHandlerStore<IUser, any>;
}

export default function TrainerView({ storeKey, store }: ITrainerViewProps) {
    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: trainer, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!trainer) {
        return null;
    }

    const handleCloseView = () => {
        reset();
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Trainer Details"
                    description="View detailed information about this trainer"
                >
                    <TrainerDetailContent trainer={trainer} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface ITrainerDetailContentProps {
    trainer: IUser;
}

function TrainerDetailContent({ trainer }: ITrainerDetailContentProps) {
    const profile = trainer.profile;

    // Helper function to render info items
    const InfoItem = ({ icon, label, value, className = "" }: {
        icon: ReactNode;
        label: string;
        value: string | number | undefined | null | ReactNode;
        className?: string;
    }) => (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <span className="text-sm text-muted-foreground">{label}:</span>
                <p className="font-medium">{value || 'Not specified'}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p className="text-green-600 font-medium">{trainer.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={trainer.isActive ? "default" : "secondary"}>
                                {trainer.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Trainer since {new Date(trainer.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </AppCard>

            <div className="">
                {/* Personal Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Personal Information</span>
                                <p className="text-sm text-muted-foreground">Basic trainer details and contact information</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <InfoItem
                            icon={<User className="w-4 h-4" />}
                            label="Full Name"
                            value={profile ? `${profile.firstName} ${profile.lastName}` : undefined}
                        />
                        <InfoItem
                            icon={<Mail className="w-4 h-4" />}
                            label="Email"
                            value={trainer.email}
                        />
                        <InfoItem
                            icon={<Phone className="w-4 h-4" />}
                            label="Phone Number"
                            value={profile?.phoneNumber}
                        />
                        <InfoItem
                            icon={<MapPin className="w-4 h-4" />}
                            label="Address"
                            value={profile?.address}
                        />
                        <InfoItem
                            icon={<User className="w-4 h-4" />}
                            label="Gender"
                            value={profile?.gender}
                        />
                    </div>
                </AppCard>

                {/* Professional Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Professional Information</span>
                                <p className="text-sm text-muted-foreground">Training experience, specialties, and ratings</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem
                                icon={<Calendar className="w-4 h-4" />}
                                label="Experience"
                                value={profile?.experience ? `${profile.experience} years` : '0 years'}
                            />
                            <InfoItem
                                icon={<Star className="w-4 h-4 text-yellow-500" />}
                                label="Rating"
                                value={profile?.rating ? `${profile.rating}/5.0` : '0/5.0'}
                            />
                        </div>

                        <InfoItem
                            icon={<Target className="w-4 h-4" />}
                            label="Specialties"
                            value={profile?.specialties && profile.specialties.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.specialties.map((specialty, index) => (
                                        <Badge key={index} variant="outline">
                                            {specialty}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No specialties specified</p>
                            )}
                        />

                        {/* Bio/Notes */}
                        {profile?.bio && (
                            <div className="pt-4 border-t">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Bio:</span>
                                </div>
                                <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                                    {profile.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </AppCard>
            </div>

            {/* Additional Information */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Additional Information</span>
                            <p className="text-sm text-muted-foreground">Account details and timestamps</p>
                        </div>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                        icon={<Calendar className="w-4 h-4" />}
                        label="Member Since"
                        value={new Date(trainer.createdAt).toLocaleDateString()}
                    />
                    <InfoItem
                        icon={<Calendar className="w-4 h-4" />}
                        label="Last Updated"
                        value={new Date(trainer.updatedAt).toLocaleDateString()}
                    />
                </div>
            </AppCard>

            {/* Trainer Availability & Schedule */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Availability & Schedule</span>
                            <p className="text-sm text-muted-foreground">Trainer's availability and scheduling preferences</p>
                        </div>
                    </div>
                }
            >
                {trainer.availability ? (
                    <div className="space-y-6">
                        {/* Weekly Schedule */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Weekly Schedule
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(trainer.availability.weeklySchedule).map(([day, schedule]) => (
                                    <div key={day} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium capitalize">{day}</span>
                                            <Badge variant={schedule.enabled ? "default" : "secondary"}>
                                                {schedule.enabled ? "Available" : "Unavailable"}
                                            </Badge>
                                        </div>
                                        {schedule.enabled && schedule.timeSlots.length > 0 && (
                                            <div className="space-y-1">
                                                {schedule.timeSlots.map((slot, index) => (
                                                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        {slot.start} - {slot.end}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {schedule.enabled && schedule.timeSlots.length === 0 && (
                                            <div className="text-sm text-muted-foreground">No time slots set</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Unavailable Periods */}
                        {trainer.availability.unavailablePeriods && trainer.availability.unavailablePeriods.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-red-500" />
                                    Unavailable Periods
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {trainer.availability.unavailablePeriods.map((period, index) => (
                                        <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-red-700">
                                                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-red-600">
                                                Reason: {period.reason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground italic">
                            * All times are displayed in local timezone
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No availability information set</p>
                        <p className="text-sm">This trainer hasn't configured their availability yet</p>
                    </div>
                )}
            </AppCard>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                    View Sessions
                </Button>
                <Button variant="outline" size="sm">
                    View Clients
                </Button>
                <Button size="sm">
                    Edit Trainer
                </Button>
            </div>
        </div>
    );
}