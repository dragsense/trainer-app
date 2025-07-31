
// External Libraries
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IUser, TUserData } from "@/@types/user.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { CredentialModal } from "@/components/custom-ui/credential-modal";

// Hooks
import { useStore } from "zustand";

export interface IClientFormModalProps {
  storeKey: string;
}

export default function ClientFormModal({
  storeKey
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

  const {isSubmitting, response} = useStore(formStore);
  const { isEditing, isCreating, setResetActions } = useStore(singleStore);

  const [credentialModalOpen, setCredentialModalOpen] = useState(false);


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
      type: "text",
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
    if (state === false) setResetActions();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          setResetActions();
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

  return <>

    <ModalForm<TUserData, IUser>
      title={`${isEditing ? "Edit" : "Add"} Client`}
      description={`${isEditing ? "Edit" : "Add a new"} trainer`}
      open={isEditing || isCreating}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {inputs}
      </div>
    </ModalForm>

    {isEditing && response && (
      <CredentialModal
        open={credentialModalOpen}
        onOpenChange={(state: boolean) => {
          if (!state) {
            setCredentialModalOpen(false);
          }
        }}
        closeModal={() => {
          setCredentialModalOpen(false);
        }}
        email={response.email}
        password={response.password}
      />
    )}

  </>
}
