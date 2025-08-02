import React from 'react';
import { PageInnerLayout } from '@/layouts';
import BillingAnalytics from '@/page-components/dashboard/billing-analytics';

const BillingAnalyticsPage: React.FC = () => {
  return (
    <PageInnerLayout Header={<Header />}>
      <BillingAnalytics />
    </PageInnerLayout>
  );
};

const Header = () => null;

export default BillingAnalyticsPage;
