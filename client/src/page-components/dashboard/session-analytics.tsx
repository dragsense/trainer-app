import React from 'react';
import { z } from 'zod';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { SessionStatsView } from '@/components/admin';

// API
import { fetchSessionsAnalytics } from '@/services/dashboard.api';

// Types
import { ISessionsAnalytics } from '@/@types/dashboard.type';

const SessionAnalytics: React.FC = () => {
  return (
    <SingleHandler<ISessionsAnalytics, Record<string, never>, ISessionsAnalytics>
      queryFn={() => fetchSessionsAnalytics()}
      storeKey="sessionAnalytics"
      SingleComponent={SessionStatsView}
      FormComponent={() => <div></div>}
      initialValues={{} as Record<string, never>}
      validationSchema={z.object({})}
      id={1}
    />
  );
};

export default SessionAnalytics;
