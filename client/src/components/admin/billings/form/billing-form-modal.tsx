// External Libraries
import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { FormInputs, useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfigObject, TFieldConfigObjectPartial } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TBillingData } from "@shared/types/billing.type";
import { IUser } from "@shared/interfaces/user.interface";
import { THandlerComponentProps } from "@/@types/handler-types";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { LineItemInput } from "./line-item-input";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { CreateBillingDto, UpdateBillingDto } from "@shared/dtos";



export interface IBillingFormExtraProps {
  open: boolean,
  onClose: () => void,
  isEditing?: boolean
}

interface IBillingFormModalProps extends THandlerComponentProps<TFormHandlerStore<TBillingData, IMessageResponse, IBillingFormExtraProps>> {
}

const BillingFormModal = React.memo(function BillingFormModal({
  storeKey,
  store
}: IBillingFormModalProps) {

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isEditing = store((state) => state.extra.isEditing)
  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)

  const UserSelect = React.memo(
    ({ props }: { props: any }) => (
      <SearchableInputWrapper<IUser>
        {...props}
        modal={true}
        useSearchable={() => useSearchableUsers({})}
        getLabel={(item) => {
          if (typeof item === 'object' && 'email' in item && item.email) {
            return item.email
          }
          return 'Select User'
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, email: item.email } }}
        shouldFilter={false}
      />
    )
  );

  const fields = useMemo(() => {
    const dto = isEditing ? UpdateBillingDto : CreateBillingDto;


    return dtoToFields(dto, {
      user: {
        type: "custom",
        Component: (props) => <UserSelect props={props} />,
      },
      lineItems: {
        type: "custom",
        Component: LineItemInput,
      }
    }) as TFieldConfigObject<TBillingData>;
  }, [isEditing]);

  const inputs = useInput<TBillingData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TBillingData>;

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
      <Button type="submit" disabled={false}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  );

  return <>
    <ModalForm<TBillingData, IMessageResponse, IBillingFormExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Billing`}
      description={`${isEditing ? "Edit" : "Add a new"} billing`}
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
            {inputs.user as React.ReactNode}
            {inputs.type}
            {inputs.status}
            {inputs.currency}
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.issueDate}
            {inputs.dueDate}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.lineItems}
          </div>
        </div>

        {/* Financial Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.totalTax}
            {inputs.discount}
            {inputs.totalAmount}
            {inputs.paymentMethodType}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Info</h3>
          <div className="grid grid-cols-1 gap-6 items-start">
            {inputs.notes}
            {inputs.terms}
          </div>
        </div>
      </div>
    </ModalForm>
  </>
});

export default BillingFormModal;
