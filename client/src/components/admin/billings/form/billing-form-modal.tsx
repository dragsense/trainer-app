// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import {  TBillingData } from "@shared/types/billing.type";
import { EBillingCurrency, EBillingStatus } from "@shared/enums/billing.enum";
import { IUser } from "@shared/interfaces/user.interface";
import { EPaymentMethodType }   from "@shared/enums/payment-method.enum";
import { IBilling } from "@shared/interfaces/billing.interface";
// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { LineItemInput } from "./line-item-input";
import { THandlerComponentProps } from "@/@types/handler-types";
import { useShallow } from "zustand/shallow";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";



export interface IBillingFormExtraProps {
  open: boolean,
  onClose: () => void,
  isEditing?: boolean
}

interface IBillingFormModalProps extends THandlerComponentProps<TFormHandlerStore<TBillingData, IMessageResponse, IBillingFormExtraProps>> {
}

export default function BillingFormModal({
  storeKey,
  store
}: IBillingFormModalProps) {



  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }


  const {isSubmitting, extra} = store(useShallow(state => ({
    isSubmitting: state.isSubmitting,
    extra: state.extra,
  })));

  const {open, onClose, isEditing} = extra;

  const fields = useMemo<TFieldConfig<TBillingData>[]>(() => [
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
      options: Object.values(EBillingStatus).map((value) => ({ label: value, value })),
    },
    {
      id: "currency",
      name: "currency",
      label: "Currency",
      type: "select",
      required: false,
      options: Object.values(EBillingCurrency).map((value) => ({ label: value, value })),
    },
     {
      id: "paymentMethodType",
      name: "paymentMethodType",
      label: "Payment Method",
      type: "select",
      required: false,
      options: Object.values(EPaymentMethodType).map((value) => ({ label: value, value })),
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

    <ModalForm<TBillingData, IBilling, IBillingFormExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Billing`}
      description={`${isEditing ? "Edit" : "Add a new"} billing`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {inputs}
      </div>
    </ModalForm>

  </>
}
