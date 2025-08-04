// External Libraries

// Components
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/layout-ui/app-card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";

// Types
import { IStripeConnectStatus, TCreateStripeConnectData, IStripeConnectCreateResponse } from "@/@types/setting.type";

// Stores
import { useStore } from "zustand";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IStripeConnectFormProps {
    storeKey: string;
}

export default function StripeConnectForm({ storeKey }: IStripeConnectFormProps) {
    const formStoreKey = storeKey + "-form";
    const singleStoreKey = storeKey + "-single";

    const formStore = useRegisteredStore<TFormHandlerStore<TCreateStripeConnectData, IStripeConnectCreateResponse>>(formStoreKey);
    const singleStore = useRegisteredStore<TSingleHandlerStore<IStripeConnectStatus>>(singleStoreKey);

    if (!formStore || !singleStore) {
        return <div>Store not found. Did you forget to register it?</div>;
    }

    const { isSubmitting, onSubmit } = useStore(formStore);
    const { response: accountStatus, isLoading } = useStore(singleStore);

    const hasAccount = accountStatus?.account !== null;
    const isComplete = accountStatus?.isComplete || false;
    const account = accountStatus?.account;

    const handleCreateAccount = () => {
        onSubmit?.(undefined);
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your Stripe Connect account? This action cannot be undone.')) {
            // Handle delete through mutation
            console.log('Delete account');
        }
    };

    if (isLoading) {
        return (
            <AppCard className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppCard>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Stripe Connect</h1>
                <p className="text-muted-foreground mt-1">
                    Connect your Stripe account to receive payments directly from clients
                </p>
            </div>

            <AppCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Stripe Connect Account</h3>
                            <p className="text-sm text-muted-foreground">
                                Connect your Stripe account to receive payments
                            </p>
                        </div>
                    </div>
                    
                    {isComplete ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                        </Badge>
                    ) : hasAccount ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Incomplete
                        </Badge>
                    ) : (
                        <Badge variant="outline">
                            Not Connected
                        </Badge>
                    )}
                </div>

                {!hasAccount && (
                    <div className="text-center py-8">
                        <div className="p-4 bg-gray-50 rounded-lg mb-4 inline-block">
                            <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
                        </div>
                        <h4 className="text-lg font-medium mb-2">Connect Your Stripe Account</h4>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Create a Stripe Connect account to start receiving payments directly from your clients. 
                            You'll receive 98% of each payment, with a 2% platform fee automatically deducted.
                        </p>
                        <Button 
                            onClick={handleCreateAccount} 
                            disabled={isSubmitting}
                            size="lg"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Connect Stripe Account'}
                        </Button>
                    </div>
                )}

                {hasAccount && !isComplete && (
                    <div className="space-y-4">
                        <div className="relative w-full rounded-lg border p-4 bg-yellow-50 border-yellow-200">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <div className="text-sm text-yellow-800">
                                    Your account setup is incomplete. Complete the onboarding process to start receiving payments.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {hasAccount && isComplete && (
                    <div className="space-y-6">
                        <div className="relative w-full rounded-lg border p-4 border-green-200 bg-green-50">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <div className="text-sm text-green-800">
                                    Your Stripe Connect account is fully set up and ready to receive payments!
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Account Type</span>
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">{account?.type} Account</p>
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Account ID</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-mono">{account?.id}</p>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Payment Terms</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• You receive 98% of each payment</li>
                                <li>• 2% platform fee automatically deducted</li>
                                <li>• Payments transferred directly to your account</li>
                                <li>• Real-time payment processing</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                disabled={isSubmitting}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                )}
            </AppCard>
        </div>
    );
}
