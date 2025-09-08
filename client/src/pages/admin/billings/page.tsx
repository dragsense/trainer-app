// React & Hooks
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { DollarSign, FileText, Receipt } from "lucide-react";

// shadcn Tabs
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Layout
import { PageInnerLayout } from "@/layouts";
import { ADMIN_ROUTES } from "@/config/routes.config";

export default function BillingPage() {
    return (
        <PageInnerLayout Header={<Header />}>
            <Outlet />
        </PageInnerLayout>
    );
}

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        {
            name: "Billings",
            icon: DollarSign,
            to: `${ADMIN_ROUTES.BILLINGS}`,
        },

        {
            name: "Stripe Invoices",
            icon: FileText,
            to: `${ADMIN_ROUTES.STRIPE_INVOICES}`,
        },
        {
            name: "Stripe Transactions",
            icon: Receipt,
            to: `${ADMIN_ROUTES.STRIPE_TRANSACTIONS}`,
        },
    ];

    // Figure out which tab should be active based on current URL
    const currentPath = location.pathname;
    const activeTab =
        tabs
            .slice() // clone array
            .sort((a, b) => b.to.length - a.to.length) // longest path first
            .find(tab => currentPath.startsWith(tab.to))?.to || tabs[0].to;

    return (
        <Tabs
            value={activeTab}
            onValueChange={(val) => navigate(val)}
            className="w-full"
        >
            <TabsList className="w-full grid grid-cols-4">
                {tabs.map(tab => (
                    <TabsTrigger key={tab.to} value={tab.to} className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
