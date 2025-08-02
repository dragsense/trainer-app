import { PageInnerLayout } from '@/layouts';
import { BillingAnalytics } from '@/page-components';

export default function BillingAnalyticsPage() {
    return (
        <PageInnerLayout Header={<Header />}>
            <BillingAnalytics />
        </PageInnerLayout>
    );
};

const Header = () => null;

