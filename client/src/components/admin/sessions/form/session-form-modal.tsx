
// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import { ISession, TSessionData } from "@/@types/session.type";
import { BillingCurrency } from "#/modules/v1/billings/enums/billing.enum";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IUser } from "@/@types/user.type";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";



export interface ISessionFormModalProps {
  storeKey: string;
  open: boolean;
  isEditing?: boolean;
  onClose: () => void;
  trainerId?: number;
}

export default function SessionFormModal({
  storeKey,
  open,
  isEditing = false,
  onClose,
  trainerId
}: ISessionFormModalProps) {

  const formStoreKey = storeKey + "-form";

  const formStore = useRegisteredStore<TFormHandlerStore<TSessionData, ISession>>(formStoreKey);

  if (!formStore) {
    return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
  }


  const isSubmitting = formStore(state => state.isSubmitting);


  const UserSelect = React.memo(
    ({ props, level, multiple = false }: { props: any; level: number; multiple?: boolean; }) => (
      <SearchableInputWrapper<IUser>
        {...props}
        modal={true}
        multiple={multiple}
        useSearchable={() => useSearchableUsers({ level })}
        getLabel={(item) => item.email}
        getKey={(item) => item.id.toString()}
        shouldFilter={false}
      />
    )
  );

  const fields = useMemo<TFieldConfig[]>(() => [
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
      label: "Price per client (cents)",
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
    {
      id: "paymentMethodType",
      name: "paymentMethodType",
      label: "Payment Method",
      type: "select",
      required: false,
      options: Object.values(PaymentMethodType).map((value) => ({ label: value, value })),
    },
    {
      id: "trainerId",
      name: "trainerId",
      label: "Trainer",
      placeholder: "Select Trainer",
      type: "custom",
      required: true,
      valueType: "number",
      disabled: !!trainerId,
      Component: (props) => (
        <UserSelect props={props} level={UserLevels[UserRole.TRAINER]} />

      ),
    },
    {
      id: "clientIds",
      name: "clientIds",
      label: "Client",
      placeholder: "Select Client",
      type: "custom",
      required: true,
      valueType: "number",
      Component: (props) => (
        <UserSelect props={props} multiple={true} level={UserLevels[UserRole.USER]} />

      ),
    },
    {
      id: "location",
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Gym Room 1 or https://zoom.us/...",
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

    <ModalForm<TSessionData, ISession>
      title={`${isEditing ? "Edit" : "Add"} Session`}
      description={`${isEditing ? "Edit" : "Add a new"} session`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={formStore}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">

        {/* Session Info */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Session Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(0, 4) /* title → dateTime */}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(4, 6) /* duration → pricePerClient */}
            {inputs.slice(6, 8) /* currency */}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Trainer & Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(8, 10) /* trainerId → clientId */}
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Additional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(10) /* location → cancellationDeadline */}
          </div>
        </div>

      </div>
    </ModalForm>

  </>
}
