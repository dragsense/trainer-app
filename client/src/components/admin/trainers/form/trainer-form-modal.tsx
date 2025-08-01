
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

export interface ITrainerFormModalProps {
  storeKey: string;
}

export default function TrainerFormModal({
  storeKey
}: ITrainerFormModalProps) {

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
      id: "certifications",
      name: "certifications",
      label: "Certifications",
      type: "multiSelect",
      options: [
        { value: "cpt", label: "Certified Personal Trainer" },
        { value: "nutrition", label: "Nutrition Certification" },
        { value: "yoga", label: "Yoga Certification" },
        { value: "pilates", label: "Pilates Certification" },
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
      title={`${isEditing ? "Edit" : "Add"} Trainer`}
      description={`${isEditing ? "Edit" : "Add a new"} trainer`}
      open={isEditing || isCreating}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
      width="3xl"
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
