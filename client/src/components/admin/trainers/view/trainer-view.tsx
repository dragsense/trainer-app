import { useShallow } from 'zustand/shallow';
import { User, Mail, Phone, MapPin, Star, Calendar, Target } from "lucide-react";

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";

// Types
import { IUser } from "@/@types/user.type";

// Stores
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ITrainerViewProps {
    storeKey: string;
}

// Trainer Detail Content Component for the modal
function TrainerDetailContent({ trainer }: { trainer: IUser }) {
    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="font-semibold">Personal Information</span>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <p className="text-sm">{trainer.profile?.firstName} {trainer.profile?.lastName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {trainer.email}
                            </p>
                        </div>
                        {trainer.profile?.phoneNumber && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="text-sm flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {trainer.profile.phoneNumber}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        {trainer.profile?.address && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p className="text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {trainer.profile.address}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="flex items-center gap-2">
                                <Badge variant={trainer.isActive ? 'default' : 'secondary'}>
                                    {trainer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </AppCard>

            {/* Professional Information */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        <span className="font-semibold">Professional Information</span>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trainer.profile?.experience && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                                <p className="text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {trainer.profile.experience} years
                                </p>
                            </div>
                        )}
                        {trainer.profile?.rating && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Rating</label>
                                <p className="text-sm flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    {trainer.profile.rating}/5.0
                                </p>
                            </div>
                        )}
                    </div>

                    {trainer.profile?.bio && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                            <p className="text-sm mt-1">{trainer.profile.bio}</p>
                        </div>
                    )}

                    {trainer.profile?.specialties && trainer.profile.specialties.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Specialties</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {trainer.profile.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="outline">{specialty}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {trainer.profile?.certifications && trainer.profile.certifications.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Certifications</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {trainer.profile.certifications.map((certification, index) => (
                                    <Badge key={index} variant="secondary">{certification}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </AppCard>

            {/* Availability Section */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">Availability & Schedule</span>
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
        </div>
    );
}

export default function TrainerView({ storeKey }: ITrainerViewProps) {
    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }



    const { response: trainer, action, reset } = singleStore(useShallow(state => ({
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
        <>
            <Dialog open={action === 'view'} onOpenChange={(open) => !open && handleCloseView()}>
                <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                    <AppDialog
                        title={`${trainer.profile?.firstName} ${trainer.profile?.lastName} - Trainer Details`}
                        description="View complete trainer profile, availability, and schedule information"
                    >
                        <TrainerDetailContent trainer={trainer} />
                    </AppDialog>
                </DialogContent>
            </Dialog>
        </>
    );
}
