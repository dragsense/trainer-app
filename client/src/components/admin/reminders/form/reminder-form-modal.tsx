// External Libraries
import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { FormInputs, useInput } from "@/hooks/use-input";
import { useSearchableBillings, useSearchableSessions, useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfigObject, TFieldConfigObjectPartial } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TReminderData } from "@shared/types/reminder.type";
import { IBilling } from "@shared/interfaces/billing.interface";
import { IUser } from "@shared/interfaces/user.interface";
import { ISession } from "@shared/interfaces/session.interface";
import { THandlerComponentProps } from "@/@types/handler-types";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { CreateReminderDto, UpdateReminderDto } from "@shared/dtos";


export interface IReminderFormExtraProps {
  open: boolean,
  onClose: () => void,
  isEditing?: boolean
}

interface IReminderFormModalProps extends THandlerComponentProps<TFormHandlerStore<TReminderData, IMessageResponse, IReminderFormExtraProps>> {
}

const ReminderFormModal = React.memo(function ReminderFormModal({
  storeKey,
  store
}: IReminderFormModalProps) {

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

  const SessionSelect = React.memo(
    ({ props }: { props: any }) => (
      <SearchableInputWrapper<ISession>
        {...props}
        modal={true}
        useSearchable={() => useSearchableSessions({})}
        getLabel={(item) => {
          if (typeof item === 'object' && 'title' in item && item.title) {
            return item.title
          }
          return 'Select Session'
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, title: item.title } }}
        shouldFilter={false}
      />
    )
  );

  const BillingSelect = React.memo(
    ({ props }: { props: any }) => (
      <SearchableInputWrapper<IBilling>
        {...props}
        modal={true}
        useSearchable={() => useSearchableBillings({})}
        getLabel={(item) => {

          if (typeof item === 'object' && 'localInvoiceNumber' in item && item.localInvoiceNumber) {
            return item.localInvoiceNumber
          }
          return 'Select Billing'
        }}
        getKey={(item) => item.id.toString()}
        getValue={(item) => { return { id: item.id, localInvoiceNumber: item.localInvoiceNumber } }}
        shouldFilter={false}
      />
    )
  );

  const fields = useMemo(() => {
    const dto = isEditing ? UpdateReminderDto : CreateReminderDto;
    const overrides: TFieldConfigObjectPartial<TReminderData> = {
      recipient: {
        type: "custom",
        Component: (props) => <UserSelect props={props} />,
      },
      session: {
        type: "custom",
        Component: (props) => <SessionSelect props={props} />,
      },
      billing: {
        type: "custom",
        Component: (props) => <BillingSelect props={props} />,
      }
    };

    return dtoToFields(dto, overrides as any) as TFieldConfigObject<TReminderData>;
  }, [isEditing]);

  const inputs = useInput<TReminderData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TReminderData>;

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
    <ModalForm<TReminderData, IMessageResponse, IReminderFormExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Reminder`}
      description={`${isEditing ? "Edit" : "Add a new"} reminder`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.type}
            {inputs.title}
            {inputs.message}
            {inputs.scheduledAt}
            {inputs.endDate}
          </div>
        </div>

        {/* Recipient & Related */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Recipient & Related</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.recipient as React.ReactNode}
            {inputs.session as React.ReactNode}
            {inputs.billing as React.ReactNode}
          </div>
        </div>

        {/* Frequency Settings */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Frequency Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.frequencyConfig?.frequency as React.ReactNode}
            {inputs.frequencyConfig?.intervalMinutes as React.ReactNode}
            {inputs.frequencyConfig?.weekdays as React.ReactNode}
            {inputs.frequencyConfig?.monthDays as React.ReactNode}
            {inputs.frequencyConfig?.timeOfDay as React.ReactNode}
          </div>
        </div>

        {/* Delivery & Priority */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Delivery & Priority</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.actions}
            {inputs.priority}
          </div>
        </div>

        {/* Retry Settings */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Retry Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.maxAttempts}
            {inputs.retryInterval}
            {inputs.isRecurring}
            {inputs.recurringInterval}
          </div>
        </div>
      </div>
    </ModalForm>
  </>
});

export default ReminderFormModal;