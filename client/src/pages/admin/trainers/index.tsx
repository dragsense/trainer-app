
import { useQueryClient } from "@tanstack/react-query";

// Types
import { IUser } from "@/@types/user.type";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { UserList, TrainerView } from "@/components/admin";
import { UserForm, TUserExtraProps, TrainerClientAssignForm } from "@/page-components";


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
      <SingleHandler<IUser, TUserExtraProps>
        queryFn={fetchUser}
        deleteFn={deleteUser}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={TrainerView}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: UserForm
          },
          {
            action: 'assignClient',
            comp: TrainerClientAssignForm
          },
        ]}
        singleProps={{
          level: UserLevels[UserRole.TRAINER],
        }}
      />

      <ListHandler<IUser>
        queryFn={(params) => fetchUsers(params, UserLevels[UserRole.TRAINER])}
        ListComponent={UserList}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
