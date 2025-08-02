import React from 'react';
import { z } from 'zod';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { PaymentMethodView } from '@/components/admin';

// API
import { fetchPaymentMethodsOverview } from '@/services/dashboard.api';

// Types
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

const PaymentMethodsAnalytics: React.FC = () => {
  return (
    <SingleHandler<IPaymentMethodsOverview, Record<string, never>, IPaymentMethodsOverview>
      queryFn={() => fetchPaymentMethodsOverview()}
      storeKey="paymentMethodsAnalytics"
      SingleComponent={PaymentMethodView}
      FormComponent={() => <div></div>}
      initialValues={{} as Record<string, never>}
      validationSchema={z.object({})}
      id={1}
    />
  );
};

export default PaymentMethodsAnalytics;
