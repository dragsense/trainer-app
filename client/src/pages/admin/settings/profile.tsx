// External Libraries
import { z } from "zod";

// Types
import { IProfile } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { ProfileCardForm } from "@/components/admin/settings";

// API
import { fetchProfile, updateProfile } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { UserGender } from "#/modules/v1/users/enums/user.enum";

// Schema
export const ProfileSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  gender: z.nativeEnum(UserGender).optional(),
  fitnessGoals: z.array(z.string()).optional(),
});

export default function ProfilePage() {
  const PROFILE_INITIAL_VALUES: TDefaultValue<Partial<IProfile>> = {
    firstName: { value: "" },
    lastName: { value: "" },
    phoneNumber: { value: "" },
    address: { value: "" },
    bio: { value: "" },
    gender: { value: UserGender.MALE },
    fitnessGoals: { value: [] },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>
      
      <SingleHandler<IProfile, Partial<IProfile>, IProfile | IMessageResponse>
        queryFn={fetchProfile}
        storeKey="profileSettings"
        mutationFns={{
          updateFn: () => updateProfile
        }}
        FormComponent={ProfileCardForm}
        validationSchema={ProfileSchema}
        initialValues={PROFILE_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />
    </div>
  );
}
