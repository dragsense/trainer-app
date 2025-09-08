import { useQueryClient } from "@tanstack/react-query";

// Types
import { IUser } from "@/@types/user.type";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { ClientTable } from "@/components/admin";
import { ClientView } from "@/components/admin/clients";
import { ClientForm, TrainerClientAssignForm } from "@/page-components";


// API
import { deleteUser, fetchUser, fetchUsers } from "@/services/user.api";

// Types
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function ClientsPage() {

  const queryClient = useQueryClient();

  const STORE_KEY = 'client';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IUser>
        queryFn={fetchUser}
        deleteFn={deleteUser}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={ClientView}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: ClientForm
          },
          {
            action: 'assignTrainer',
            comp: TrainerClientAssignForm
          },
        ]}
      />

      <ListHandler<IUser>
        queryFn={(params) => fetchUsers(params, UserLevels[UserRole.USER])}
        ListComponent={ClientTable}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
