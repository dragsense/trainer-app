// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import { IBilling, TBillingData } from "@/@types/billing.type";
import { BillingCurrency, BillingStatus } from "#/modules/v1/billings/enums/billing.enum";
import { IUser } from "@/@types/user.type";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { LineItemInput } from "./line-item-input";



export interface IBillingFormModalProps {
  storeKey: string;
  open: boolean;
  isEditing?: boolean;
  onClose: () => void;
}

export default function BillingFormModal({
  storeKey,
  open,
  isEditing = false,
  onClose,
}: IBillingFormModalProps) {

  const formStoreKey = storeKey + "-form";

  const formStore = useRegisteredStore<TFormHandlerStore<TBillingData, IBilling>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }


  const isSubmitting = formStore(state => state.isSubmitting);


  const fields = useMemo<TFieldConfig[]>(() => [
    {
      id: "userId",
      name: "userId",
      label: "User",
      placeholder: "Select User",
      type: "custom",
      required: true,
      valueType: "number",
      Component: (props) => (
        <SearchableInputWrapper<IUser>
          {...props}
          modal={true}

          useSearchable={() => useSearchableUsers({})}
          getLabel={(item) => item.email}
          getKey={(item) => item.id.toString()}
          shouldFilter={false}
        />

      ),
    },
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
      id: "paymentMethodType",
      name: "paymentMethodType",
      label: "Payment Method",
      type: "select",
      required: false,
      options: Object.values(PaymentMethodType).map((value) => ({ label: value, value })),
    },
    {
      id: "totalTax",
      name: "totalTax",
      label: "Total Tax (cents)",
      type: "number",
      valueType: "number",
      required: false,
    },
    {
      id: "discount",
      name: "discount",
      label: "Discount (cents)",
      type: "number",
      valueType: "number",
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
  ], []);


  const { inputs } = useInput({
    fields,
    showRequiredAsterisk: true,
  });

  const onOpenChange = (state: boolean) => {
    if (state === false) onClose();
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

  return <>

    <ModalForm<TBillingData, IBilling>
      title={`${isEditing ? "Edit" : "Add"} Billing`}
      description={`${isEditing ? "Edit" : "Add a new"} billing`}
      open={open}
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
