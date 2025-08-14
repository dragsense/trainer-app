
// External Libraries
import { Loader2 } from "lucide-react";
// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import { IUser, TUserData } from "@/@types/user.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";


export interface ITrainerFormModalProps {
  storeKey: string;
  open: boolean;
  isEditing?: boolean;
  onClose: () => void;
}

export default function TrainerFormModal({
  storeKey,
  open,
  isEditing = false,
  onClose,
}: ITrainerFormModalProps) {

  const formStoreKey = storeKey + "-form";

  const formStore = useRegisteredStore<TFormHandlerStore<TUserData, { user: IUser, message: string }>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }

  //const isSubmitting = formStore(state => state.isSubmitting);

  const fields: TFieldConfig[] = [
    // ─── Basic Info ──────────────
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
      id: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      type: "email",
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

    // ─── Trainer-Specific Fields ─────
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
    {
      id: "isActive",
      name: "isActive",
      label: "Active Status",
      type: "switch",
      required: false,
    },
  ];

  const { inputs } = useInput({
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
    <ModalForm<TUserData, { user: IUser, message: string }>
      title={`${isEditing ? "Edit" : "Add"} Trainer`}
      description={`${isEditing ? "Edit" : "Add a new"} trainer`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={formStore}
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

        {/* Trainer Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Trainer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.slice(7, 12) /* bio → rating */}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.slice(12) /* isActive */}
          </div>
        </div>
      </div>
    </ModalForm>

  </>
}
