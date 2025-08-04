
// Components
import { AppCard } from "@/components/layout-ui/app-card";



export default function StripeConnectInfoCard() {
  


  return (
    <AppCard 
      header={<h3 className="text-lg font-semibold">How Stripe Connect Works</h3>}
    >
      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-semibold text-blue-600">1</span>
          </div>
          <div>
            <h4 className="font-medium">Connect Your Account</h4>
            <p className="text-muted-foreground">
              Link your Stripe account to start receiving payments directly from clients.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-semibold text-blue-600">2</span>
          </div>
          <div>
            <h4 className="font-medium">Secure Payments</h4>
            <p className="text-muted-foreground">
              Accept payments with industry-leading security and fraud protection.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-semibold text-blue-600">3</span>
          </div>
          <div>
            <h4 className="font-medium">Get Paid Fast</h4>
            <p className="text-muted-foreground">
              Receive automatic payouts to your bank account with low platform fees 2% per transaction.
            </p>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
