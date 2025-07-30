
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



// Schema
export const SessionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.nativeEnum(SessionType),
/*   trainerId: z.number().min(1, "Trainer is required"),
  clientId: z.number().min(1, "Client is required"), */
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().optional(),
  requirePrepayment: z.boolean().default(true),
  cancellationDeadline: z.number().default(24),
});




export default function SessionsPage() {


  const TRAINER_INITIAL_VALUES: TDefaultValue<TSessionData> = {
    title: { value: "" },
    type: { value: SessionType.ONE_ON_ONE },
    trainerId: { value: 3 },
    clientId: { value: 4 },
    startDate: { value: "" },
    startTime: { value: "" },
    duration: { value: 60 },
    price: { value: 0 },
    currency: { value: "USD" },
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
        queryListKey={"sessionsList"}
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
        initialValues={TRAINER_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />

    </PageInnerLayout>
  );
}



const Header = () => null
