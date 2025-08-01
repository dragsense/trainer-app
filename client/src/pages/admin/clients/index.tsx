
// External Libraries
import { z } from "zod";

// Types
import { IUser, TUserData } from "@/@types/user.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { ClientFormModal, ClientTable } from "@/components/admin";


// API
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "@/services/user.api";

// Types
import { UserGender, UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



// Schema
export const ClientSchema = z.object({
  // ─── Basic Info ─────────────────────
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters",
  }).optional(),

  // ─── Optional Personal Info ─────────
  gender: z.nativeEnum(UserGender).optional(),
  address: z.string().optional(),
  // ─── Client-Specific Info ──────────
  bio: z.string().optional(),
});




export default function ClientsPage() {


  const TRAINER_INITIAL_VALUES: TDefaultValue<TUserData> = {
    firstName: { value: "" },
    lastName: { value: "" },
    email: { value: "" },
    phoneNumber: { value: "" },
    bio: { value: "" },
    address: { value: "" },
    gender: { value: UserGender.MALE },
    level: { value: UserLevels[UserRole.USER], notInput: true },
    isActive: { value: true },
  };



  return (
    <PageInnerLayout Header={<Header />}>
      <ListHandler<IUser, Partial<TUserData>, IUser | IMessageResponse>
        queryListFn={(params) => fetchUsers(params, UserLevels[UserRole.USER])}
        ListComponent={ClientTable}
        storeKey="trainersList"
        mutationFns={{
          createFn: createUser,
          updateFn: updateUser,
          deleteFn: deleteUser
        }}
        queryFn={fetchUser}
        FormComponent={ClientFormModal}
        validationSchema={ClientSchema}
        initialValues={TRAINER_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />

    </PageInnerLayout>
  );
}



const Header = () => null
