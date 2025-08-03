// External Libraries
import { ReactNode } from "react";

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
import { useStore } from "zustand";
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ITrainerViewProps {
    storeKey: string;
}

// Trainer Detail Content Component for the modal
function TrainerDetailContent({ trainer, storeKey }: { trainer: IUser; storeKey: string }) {
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

            {/* Availability Section - TODO: Add availability calendar/schedule */}
            <AppCard
                header={
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">Availability & Schedule</span>
                    </div>
                }
            >
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Availability calendar coming soon...</p>
                    <p className="text-sm">This will show trainer's weekly schedule and unavailable periods</p>
                </div>
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

    const { response: trainer, isViewing, setMode } = useStore(singleStore);

    if (!trainer) {
        return null;
    }

    const handleViewDetails = () => {
        setMode('view');
    };

    const handleCloseView = () => {
        setMode('create'); // Reset to a valid mode
    };

    return (
        <>
            {/* Quick Preview Card */}
            <AppCard
                className="mb-4"
                header={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span className="text-xl font-semibold">Trainer Details</span>
                        </div>
                        <Button onClick={handleViewDetails} variant="outline" size="sm">
                            View Full Details
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">
                            {trainer.profile?.firstName} {trainer.profile?.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {trainer.email}
                        </div>
                        {trainer.profile?.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                {trainer.profile.phoneNumber}
                            </div>
                        )}
                        {trainer.profile?.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {trainer.profile.address}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        {trainer.profile?.experience && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{trainer.profile.experience} years experience</span>
                            </div>
                        )}
                        {trainer.profile?.rating && (
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">{trainer.profile.rating}/5.0</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Badge variant={trainer.isActive ? 'default' : 'secondary'}>
                                {trainer.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {trainer.profile?.bio && (
                    <div className="mt-4">
                        <h4 className="font-medium mb-2">Bio</h4>
                        <p className="text-sm text-muted-foreground">{trainer.profile.bio}</p>
                    </div>
                )}

                {trainer.profile?.specialties && trainer.profile.specialties.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Specialties
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {trainer.profile.specialties.map((specialty, index) => (
                                <Badge key={index} variant="outline">{specialty}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </AppCard>

            {/* View Modal using Dialog wrapper with AppDialog content */}
            <Dialog open={isViewing} onOpenChange={(open) => !open && handleCloseView()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <AppDialog
                        title={`${trainer.profile?.firstName} ${trainer.profile?.lastName} - Trainer Details`}
                        description="View complete trainer profile, availability, and schedule information"
                    >
                        <TrainerDetailContent trainer={trainer} storeKey={storeKey} />
                    </AppDialog>
                </DialogContent>
            </Dialog>
        </>
    );
}
