import React from 'react';
import { z } from 'zod';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { BillingView } from '@/components/admin';

// API
import { fetchBillingAnalytics } from '@/services/dashboard.api';

// Types
import { IBillingAnalytics } from '@/@types/dashboard.type';

const BillingAnalytics: React.FC = () => {
  return (
    <SingleHandler<IBillingAnalytics, Record<string, never>, IBillingAnalytics>
      queryFn={() => fetchBillingAnalytics()}
      storeKey="billingAnalytics"
      SingleComponent={BillingView}
      FormComponent={() => <div></div>}
      initialValues={{} as Record<string, never>}
      validationSchema={z.object({})}
      id={1}
    />
  );
};

export default BillingAnalytics;
