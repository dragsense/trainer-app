
// External Libraries
import { Loader2 } from "lucide-react";
// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore } from "@/stores";
import { TUserData, TUserResponse } from "@/@types/user.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { THandlerComponentProps } from "@/@types/handler-types";


export interface IUserFormModalExtraProps {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
}

interface IUserFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUserData, TUserResponse, IUserFormModalExtraProps>> {
}

export default function UserFormModal({
  storeKey,
  store,
}: IUserFormModalProps) {


  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const open = store((state) => state.extra.open)
  const isEditing = store((state) => state.extra.isEditing)
  const onClose = store((state) => state.extra.onClose)


  const fields: TFieldConfig<TUserData>[] = [
    // ─── Basic Info ──────────────

    {
      id: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      type: "email",
      required: true,
    },
    {
      id: "isActive",
      name: "isActive",
      label: "Active Status",
      type: "switch",
      required: false,
    },
    {
      id: "profile",
      name: "profile",
      label: "Profile",
      type: "nested",
      required: false,
      subFields: [
        {
          id: "firstName",
          name: "firstName",
          label: "First Name",
          placeholder: "John",
          type: "text",
          required: true,
        },
        {
          id: "lastName",
          name: "lastName",
          label: "Last Name",
          placeholder: "Doe",
          type: "text",
          required: true,
        },

        {
          id: "phoneNumber",
          name: "phoneNumber",
          label: "Phone Number",
          placeholder: "+1234567890",
          type: "tel",
          required: true,
        },

        // ─── Optional Personal Info ─────
        {
          id: "dateOfBirth",
          name: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          placeholder: "YYYY-MM-DD",
          required: false,
        },
        {
          id: "gender",
          name: "gender",
          label: "Gender",
          type: "select",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ],
          required: false,
        },
        {
          id: "address",
          name: "address",
          label: "Address",
          type: "textarea",
          placeholder: "123 Main St, City, Country",
          required: false,
        },


        // ─── User-Specific Fields ─────
        {
          id: "bio",
          name: "bio",
          label: "Bio",
          type: "textarea",
          placeholder: "Short description about yourself...",
          required: false,
        },
        {
          id: "specialties",
          name: "specialties",
          label: "Specialties",
          type: "multiSelect",
          options: [
            { value: "yoga", label: "Yoga" },
            { value: "weightTraining", label: "Weight Training" },
            { value: "cardio", label: "Cardio" },
            { value: "pilates", label: "Pilates" },
          ],
          required: false,
        },
        {
          id: "experience",
          name: "experience",
          label: "Experience (years)",
          type: "number",
          valueType: "number",
          min: 0,
          required: false,
        },
        {
          id: "rating",
          name: "rating",
          label: "Rating",
          type: "rating",
          required: false,
        },
      ]
    }
  ];

  const { inputs } = useInput<TUserData>({
    fields,
    showRequiredAsterisk: true,
  });

  const onOpenChange = (state: boolean) => {
    if (state === false)
      onClose();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={false}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  );


  return <>
    <ModalForm<TUserData, TUserResponse, IUserFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} User`}
      description={`${isEditing ? "Edit" : "Add a new"} User`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.slice(0, 4) /* firstName → phoneNumber */}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.slice(4, 7) /* dateOfBirth → address */}
          </div>
        </div>

        {/* User Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">User Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.slice(7, 12) /* bio → rating */}
          </div>
        </div>

    
      </div>
    </ModalForm>

  </>
}
