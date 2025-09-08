
import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { SessionView, SessionViewModal } from "@/components/admin";
import { SessionForm } from "@/page-components";


// API
import { deleteSession, fetchSession, fetchSessions } from "@/services/session.api";

// Types
import { ISession } from "@/@types/session.type";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function SessionsPage() {

  const querySession = useQueryClient();

  const STORE_KEY = 'session';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<ISession>
        queryFn={fetchSession}
        deleteFn={deleteSession}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => querySession.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={SessionViewModal}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: SessionForm
          },
        ]}
      />

      <ListHandler<ISession>
        queryFn={fetchSessions}
        ListComponent={SessionView}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
