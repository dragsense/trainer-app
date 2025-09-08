
// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IUser, TUserData } from "@/@types/user.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";


export interface IClientFormModalProps {
  storeKey: string;
  open: boolean;
  isEditing?: boolean;
  onClose: () => void;
}

export default function ClientFormModal({
  storeKey,
  open,
  isEditing = false,
  onClose,
}: IClientFormModalProps) {

  const formStoreKey = storeKey + "-form";
  const singelStoreKey = storeKey + "-single";

  const formStore = useRegisteredStore<TFormHandlerStore<TUserData, IUser>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const isSubmitting = formStore(state => state.isSubmitting);


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

    // ─── Client-Specific Fields ─────
    {
      id: "bio",
      name: "bio",
      label: "Bio",
      type: "textarea",
      placeholder: "Short description about yourself...",
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  );

  return <ModalForm<TUserData, IUser>
    title={`${isEditing ? "Edit" : "Add"} Client`}
    description={`${isEditing ? "Edit" : "Add a new"} trainer`}
    open={open}
    onOpenChange={onOpenChange}
    formStore={formStore}
    footerContent={formButtons}
  >
    <div className="space-y-8">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {inputs.slice(0, 4) /* firstName → phoneNumber */}
        </div>
      </div>

      {/* Personal Details (Optional) */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {inputs.slice(4, 7) /* dateOfBirth → address */}
        </div>
      </div>

      {/* Client Settings */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Client Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {inputs.slice(7, 8) /* bio */}
          {inputs.slice(8)     /* isActive */}
        </div>
      </div>
    </div>
  </ModalForm>
}
