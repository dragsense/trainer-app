
// External Libraries
import { z } from "zod";

// Types
import { IUser, TUserData } from "@/@types/user.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { TrainerFormModal, TrainerTable } from "@/components/admin";
import { TrainerView } from "@/components/admin/trainers";
import { AssignTrainerClientForm } from "@/page-components";


// API
import { createUser, deleteUser, fetchUser, fetchUsers, updateUser } from "@/services/user.api";

// Types
import { UserGender, UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



// Schema
export const TrainerSchema = z.object({
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
  // ─── Trainer-Specific Info ──────────
  bio: z.string().optional(),
  specialties: z.array(z.string()).min(1, {
    message: "At least one specialty is required",
  }),
  certifications: z.array(z.string()).min(1, {
    message: "At least one certification is required",
  }),
  experience: z.number().min(1, {
    message: "Experience must be a non-negative number",
  }),
  rating: z.number().min(0).max(5, {
    message: "Rating must be between 0 and 5",
  }),
});




export default function TrainersPage() {


  const TRAINER_INITIAL_VALUES: TDefaultValue<TUserData> = {
    firstName: { value: "" },
    lastName: { value: "" },
    email: { value: "" },
    phoneNumber: { value: "" },
    bio: { value: "" },
    address: { value: "" },
    gender: { value: UserGender.MALE },
    specialties: { value: [] },
    certifications: { value: [] },
    level: { value: UserLevels[UserRole.TRAINER], notInput: true },
    isActive: { value: true },
    experience: { value: 0 },
    rating: { value: 0 },
  };



  return (
    <PageInnerLayout Header={<Header />}>
      <ListHandler<IUser, Partial<TUserData>, IUser | IMessageResponse>
        queryListFn={(params) => fetchUsers(params, UserLevels[UserRole.TRAINER])}
        ListComponent={TrainerTable}
        storeKey="trainersList"
        mutationFns={{
          createFn: createUser,
          updateFn: updateUser,
          deleteFn: deleteUser
        }}
        queryFn={fetchUser}
        FormComponent={TrainerFormModal}
        SingleComponent={TrainerView}
        validationSchema={TrainerSchema}
        initialValues={TRAINER_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
        extraComponents={[
          {
            triggerAction: 'assign',
            comp: AssignTrainerClientForm
          }
        ]}
      />

    </PageInnerLayout>
  );
}



const Header = () => null
