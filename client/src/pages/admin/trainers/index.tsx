
import { useQueryClient } from "@tanstack/react-query";

// Types
import { IUser } from "@shared/interfaces/user.interface";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { UserList, TrainerView } from "@/components/admin";
import { UserForm, TUserExtraProps, TrainerClientAssignForm } from "@/page-components";


// API
import { deleteUser, fetchUser, fetchUsers } from "@/services/user.api";

// Types
import { EUserLevels, EUserRole } from "@shared/enums/user.enum";


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
          level: EUserLevels[EUserRole.TRAINER],
        }}
      />

      <ListHandler<IUser>
        queryFn={(params) => fetchUsers(params, EUserLevels[EUserRole.TRAINER])}
        ListComponent={UserList}
        storeKey={STORE_KEY}
        listProps={{
          level: EUserLevels[EUserRole.TRAINER],
        }}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
