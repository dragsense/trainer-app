
// External Libraries
import { z } from "zod";

// Types
import { ISession, TSessionData } from "@/@types/session.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { SessionType } from "#/modules/v1/sessions/enums/session.enum";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { SessionFormModal, SessionView } from "@/components/admin";


// API
import { createSession, deleteSession, fetchSession, fetchSessions, updateSession } from "@/services/session.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { BillingCurrency } from "#/modules/v1/billings/enums/billing.enum";



// Schema
export const SessionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.nativeEnum(SessionType),
  trainerId: z.number().min(1, "Trainer is required"),
  clientIds: z.array(z.number()).min(1, "Client is required"),
  dateTime: z.date().min(new Date(), "Start date must be in the future"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  pricePerClient: z.number().min(0, "Price must be positive"),
  currency: z.nativeEnum(BillingCurrency).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().optional(),
  requirePrepayment: z.boolean().default(true),
  cancellationDeadline: z.number().default(24),
});




export default function SessionsPage() {


  const INITIAL_VALUES: TDefaultValue<TSessionData> = {
    title: { value: "" },
    type: { value: SessionType.ONE_ON_ONE },
    trainerId: { value: 0 },
    clientIds: { value: [] },
    dateTime: { value: new Date() },
    duration: { value: 60 },
    pricePerClient: { value: 0 },
    currency: { value: BillingCurrency.USD },
    description: { value: "" },
    location: { value: "" },
    maxParticipants: { value: 1 },
    requirePrepayment: { value: true },
    cancellationDeadline: { value: 24 },
  };



  return (
    <PageInnerLayout Header={<Header />}>
      <ListHandler<ISession, Partial<TSessionData>, ISession | IMessageResponse>
        queryListFn={fetchSessions}
        ListComponent={SessionView}
        storeKey="sessionsList"
        mutationFns={{
          createFn: createSession,
          updateFn: updateSession,
          deleteFn: deleteSession
        }}
        queryFn={fetchSession}
        FormComponent={SessionFormModal}
        validationSchema={SessionSchema}
        initialValues={INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />

    </PageInnerLayout>
  );
}



const Header = () => null
