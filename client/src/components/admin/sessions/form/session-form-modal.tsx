
// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { ISession, TSessionData } from "@/@types/session.type";
import { BillingCurrency } from "#/modules/v1/billings/enums/billing.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useStore } from "zustand";
import { useUserListInput } from "@/hooks/use-user-list-input";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";

export interface ISessionFormModalProps {
  storeKey: string;
}

export default function SessionFormModal({
  storeKey
}: ISessionFormModalProps) {

  const formStoreKey = storeKey + "-form";
  const singelStoreKey = storeKey + "-single";

  const formStore = useRegisteredStore<TFormHandlerStore<TSessionData, ISession>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<ISession>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const { isSubmitting } = useStore(formStore);
  const { isEditing, isCreating, setResetActions } = useStore(singleStore);

  const trainerInput = useUserListInput({
    isSubmitting,
    multiple: false,
    level: UserLevels[UserRole.TRAINER],
    prefix: "trainer",
    valueType: "number"
  });
  const userInput = useUserListInput({
    isSubmitting,
    multiple: true,
    level: UserLevels[UserRole.USER],
    prefix: "client",
    valueType: "number"
  });

  const fields: TFieldConfig[] = [
    // ─── Session Basic Info ──────────────
    {
      id: "title",
      name: "title",
      label: "Session Title",
      placeholder: "Personal Training Session",
      type: "text",
      required: true,
    },
    {
      id: "description",
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Session description and notes...",
      required: false,
    },
    {
      id: "type",
      name: "type",
      label: "Session Type",
      type: "select",
      options: [
        { value: "ONE_ON_ONE", label: "One-on-One" },
        { value: "GROUP", label: "Group" },
        { value: "WORKSHOP", label: "Workshop" },
        { value: "ASSESSMENT", label: "Assessment" },
      ],
      required: true,
    },
    {
      id: "dateTime",
      name: "dateTime",
      label: "Start Date",
      type: "datetime",
      required: true,
    },
    {
      id: "duration",
      name: "duration",
      label: "Duration (minutes)",
      type: "number",
      placeholder: "60",
      min: 15,
      required: true,
    },
    {
      id: "pricePerClient",
      name: "pricePerClient",
      label: "Price per client",
      type: "number",
      placeholder: "50.00",
      valueType: "number",
      min: 0,
      required: true,
    },
    {
      id: "currency",
      name: "currency",
      label: "Currency",
      type: "select",
      options: Object.values(BillingCurrency).map((value) => ({ label: value, value })),
      required: false,
    },
    ...trainerInput,
    ...userInput,
    {
      id: "location",
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Gym Room 1 or https://zoom.us/...",
      required: false,
    },
    {
      id: "maxParticipants",
      name: "maxParticipants",
      label: "Max Participants",
      type: "number",
      valueType: "number",
      placeholder: "1",
      min: 1,
      required: false,
    },
    {
      id: "requirePrepayment",
      name: "requirePrepayment",
      label: "Require Prepayment",
      type: "switch",
      required: false,
    },
    {
      id: "cancellationDeadline",
      name: "cancellationDeadline",
      label: "Cancellation Deadline (hours)",
      type: "number",
      valueType: "number",
      placeholder: "24",
      min: 1,
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

    <ModalForm<TSessionData, ISession>
      title={`${isEditing ? "Edit" : "Add"} Session`}
      description={`${isEditing ? "Edit" : "Add a new"} session`}
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

  </>
}
