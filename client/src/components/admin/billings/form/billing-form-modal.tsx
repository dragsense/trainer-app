
// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IBilling, TBillingData } from "@/@types/billing.type";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { BillingCurrency, BillingStatus } from "#/modules/v1/billings/enums/billing.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { LineItemInput } from "./line-item-input";

// Hooks
import { useStore } from "zustand";
import { useUserListInput } from "@/hooks/use-user-list-input";

export interface IBillingFormModalProps {
  storeKey: string;
}

export default function BillingFormModal({
  storeKey
}: IBillingFormModalProps) {

  const formStoreKey = storeKey + "-form";
  const singelStoreKey = storeKey + "-single";

  const formStore = useRegisteredStore<TFormHandlerStore<TBillingData, IBilling>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const { isSubmitting } = useStore(formStore);
  const { isEditing, isCreating, setResetActions } = useStore(singleStore);

  const userInput = useUserListInput({ isSubmitting, multiple: false, level: UserLevels[UserRole.USER], prefix: "user" });

  const fields: TFieldConfig[] = [

    ...userInput,
    {
      id: "issueDate",
      name: "issueDate",
      label: "Issue Date",
      type: "date",
      required: false,
    },
    {
      id: "dueDate",
      name: "dueDate",
      label: "Due Date",
      type: "date",
      required: false,
    },
    {
      id: "lineItems",
      name: "lineItems",
      label: "Line Items",
      type: "custom",
      required: false,
      Component: LineItemInput,
    },
    {
      id: "status",
      name: "status",
      label: "Status",
      type: "select",
      required: false,
      options: Object.values(BillingStatus).map((value) => ({ label: value, value })),
    },
    {
      id: "currency",
      name: "currency",
      label: "Currency",
      type: "select",
      required: false,
      options: Object.values(BillingCurrency).map((value) => ({ label: value, value })),
    },
    {
      id: "totalAmount",
      name: "totalAmount",
      label: "Total Amount (cents)",
      type: "number",
      required: false,
    },
    {
      id: "totalTax",
      name: "totalTax",
      label: "Total Tax (cents)",
      type: "number",
      required: false,
    },
    {
      id: "discount",
      name: "discount",
      label: "Discount (cents)",
      type: "number",
      required: false,
    },

    {
      id: "notes",
      name: "notes",
      label: "Notes",
      type: "textarea",
      required: false,
    },
    {
      id: "terms",
      name: "terms",
      label: "Payment Terms",
      type: "textarea",
      placeholder: "e.g. Net 30",
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

    <ModalForm<TBillingData, IBilling>
      title={`${isEditing ? "Edit" : "Add"} Billing`}
      description={`${isEditing ? "Edit" : "Add a new"} billing`}
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
