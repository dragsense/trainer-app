
import { useQueryClient } from "@tanstack/react-query";

// Types
import { IUser } from "@/@types/user.type";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { TrainerTable } from "@/components/admin";
import { TrainerView } from "@/components/admin/trainers";
import { TrainerForm, TrainerClientAssignForm } from "@/page-components";


// API
import { deleteUser, fetchUser, fetchUsers } from "@/services/user.api";

// Types
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";


// Layouts
import { PageInnerLayout } from "@/layouts";






export default function TrainersPage() {

  const queryClient = useQueryClient();

  const STORE_KEY = 'trainer';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IUser>
        queryFn={fetchUser}
        deleteFn={deleteUser}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={TrainerView}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: TrainerForm
          },
          {
            action: 'assignClient',
            comp: TrainerClientAssignForm
          },
        ]}
      />

      <ListHandler<IUser>
        queryFn={(params) => fetchUsers(params, UserLevels[UserRole.TRAINER])}
        ListComponent={TrainerTable}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
