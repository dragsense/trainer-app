// External Libraries
import { ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { User, Mail, Phone, MapPin, Target, Calendar } from "lucide-react";

// Types
import { IUser } from "@/@types/user.type";

// Stores
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IClientViewProps {
    storeKey: string;
}

export default function ClientView({ storeKey }: IClientViewProps) {
    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { response: client, action, reset } = singleStore(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,

    })));


    if (!client) {
        return null;
    }

    const handleCloseView = () => {
        reset();
    };

    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Client Details"
                    description="View detailed information about this client"
                >
                    <ClientDetailContent client={client} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IClientDetailContentProps {
    client: IUser;
}

function ClientDetailContent({ client }: IClientDetailContentProps) {
    const profile = client.profile;

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
            <AppCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.firstName} {profile?.lastName}
                        </h2>
                        <p className="text-blue-600 font-medium">{client.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={client.isActive ? "default" : "secondary"}>
                                {client.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Client since {new Date(client.createdAt).toLocaleDateString()}
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
                                <p className="text-sm text-muted-foreground">Basic client details and contact information</p>
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
                            value={client.email}
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

                        <InfoItem
                            icon={<User className="w-4 h-4" />}
                            label="Fitness Goals:"
                            value={profile?.fitnessGoals && profile.fitnessGoals.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {profile.fitnessGoals.map((goal, index) => (
                                        <Badge key={index} variant="outline">
                                            {goal}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No fitness goals specified</p>
                            )}
                        />

                    </div>
                </AppCard>


            </div>

            {/* Additional Information */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Additional Information</span>
                            <p className="text-sm text-muted-foreground">Emergency contacts and other details</p>
                        </div>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                        icon={<Calendar className="w-4 h-4" />}
                        label="Member Since"
                        value={new Date(client.createdAt).toLocaleDateString()}
                    />
                    <InfoItem
                        icon={<Calendar className="w-4 h-4" />}
                        label="Last Updated"
                        value={new Date(client.updatedAt).toLocaleDateString()}
                    />
                </div>

                {/* Bio/Notes */}
                {profile?.bio && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Notes:</span>
                        </div>
                        <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                            {profile.bio}
                        </p>
                    </div>
                )}
            </AppCard>

            {/* Client Availability Preferences */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <div>
                            <span className="font-semibold">Availability & Preferences</span>
                            <p className="text-sm text-muted-foreground">Client's availability and scheduling preferences</p>
                        </div>
                    </div>
                }
            >
                {client.availability ? (
                    <div className="space-y-6">
                        {/* Weekly Schedule */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Preferred Schedule
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(client.availability.weeklySchedule).map(([day, schedule]) => (
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
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
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
                        {client.availability.unavailablePeriods && client.availability.unavailablePeriods.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-red-500" />
                                    Unavailable Periods
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {client.availability.unavailablePeriods.map((period, index) => (
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
                        <p>No availability preferences set</p>
                        <p className="text-sm">This client hasn't configured their availability preferences yet</p>
                    </div>
                )}
            </AppCard>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                    View Sessions
                </Button>
                <Button variant="outline" size="sm">
                    Assign Trainer
                </Button>
                <Button size="sm">
                    Edit Client
                </Button>
            </div>
        </div>
    );
}
