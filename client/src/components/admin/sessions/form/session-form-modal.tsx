// External Libraries
import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { FormInputs, useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfigObject, TFieldConfigObjectPartial } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TSessionData } from "@shared/types/session.type";
import { EUserLevels, EUserRole } from "@shared/enums/user.enum";
import { IUser } from "@shared/interfaces/user.interface";
import { THandlerComponentProps } from "@/@types/handler-types";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { CreateSessionDto, UpdateSessionDto } from "@shared/dtos";

export interface ISessionFormModalExtraProps {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
  trainerId?: number;
}

interface ISessionFormModalProps extends THandlerComponentProps<TFormHandlerStore<TSessionData, IMessageResponse, ISessionFormModalExtraProps>> {
}

const SessionFormModal = React.memo(function SessionFormModal({
  storeKey,
  store,
}: ISessionFormModalProps) {

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isEditing = store((state) => state.isEditing)
  const open = store((state) => state.extra.open)
  const onClose = store((state) => state.extra.onClose)
  const trainerId = store((state) => state.extra.trainerId)

  const UserSelect = React.memo(
    ({ props, level, multiple = false }: { props: any; level: number; multiple?: boolean; }) => (
      <SearchableInputWrapper<IUser>
        {...props}
        modal={true}
        multiple={multiple}
        useSearchable={() => useSearchableUsers({ level })}
        getLabel={(item) => {

          if (typeof item === 'object' && 'email' in item && item.email) {
            return item.email
          }
          return 'Select User'
        }}
        getValue={(item) => { return { id: item.id, email: item.email } }}
        getKey={(item) => item.id.toString()}
        shouldFilter={false}
      />
    )
  );

  const fields = useMemo(() => {
    const dto = isEditing ? UpdateSessionDto : CreateSessionDto;
    const overrides: TFieldConfigObjectPartial<TSessionData> = {
      trainer: {
        disabled: !!trainerId,
        Component: (props) => (
          <UserSelect props={props} level={EUserLevels[EUserRole.TRAINER]} />
        ),
      },
      clients: {
        Component: (props: any) => (
          <UserSelect props={props} level={EUserLevels[EUserRole.USER]} multiple={true} />
        ),
      } as any
    };

    return dtoToFields(dto, overrides as any) as TFieldConfigObject<TSessionData>;
  }, [isEditing, trainerId]);

  const inputs = useInput<TSessionData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TSessionData>;

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
    <ModalForm<TSessionData, IMessageResponse, ISessionFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Session`}
      description={`${isEditing ? "Edit" : "Add a new"} session`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Session Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Session Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.title}
            {inputs.type}
            {inputs.dateTime as any}
            {inputs.duration}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.pricePerClient}
            {inputs.currency}
            {inputs.paymentMethodType}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Trainer & Clients</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.trainer as React.ReactNode}
            {inputs.clients}
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Additional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {inputs.description}
            {inputs.location}
            {inputs.requirePrepayment}
            {inputs.cancellationDeadline}
          </div>
        </div>
      </div>

    </ModalForm>
  </>
});

export default SessionFormModal;