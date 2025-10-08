
// External Libraries
import React, { useMemo } from "react";
import { Loader2, Plus, X } from "lucide-react";
// Custom Hooks
import { FormInputs, useInput } from "@/hooks/use-input";

// Types
import { TFieldConfigObject } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TUserData, TUpdateUserData, TProfileData } from "@shared/types/user.type";
import { TUserResponse } from "@shared/interfaces/user.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { THandlerComponentProps } from "@/@types/handler-types";



export interface IUserFormModalExtraProps {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
  level: number;
}

interface IUserFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUserData, TUserResponse, IUserFormModalExtraProps>> {
}

function UserFormModal({
  storeKey,
  store,
}: IUserFormModalProps) {


  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isEditing = store((state) => state.isEditing)
  const extra = store((state) => state.extra)
  const fields = store((state) => state.fields)

  const inputs = useInput<TUserData | TUpdateUserData>({
    fields,
    showRequiredAsterisk: true,
  }) as FormInputs<TUserData | TUpdateUserData>;

  const onOpenChange = (state: boolean) => {
    if (state === false)
      extra.onClose();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          extra.onClose();
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
;

  return <>
    <ModalForm<TUserData, TUserResponse, IUserFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} User`}
      description={`${isEditing ? "Edit" : "Add a new"} User`}
      open={extra.open}
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
            {inputs.email}
            {inputs.isActive}
            {(inputs.profile as FormInputs<TProfileData>)?.firstName}
            {(inputs.profile as FormInputs<TProfileData>)?.lastName}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {(inputs.profile as FormInputs<TProfileData>)?.phoneNumber}

            {(inputs.profile as FormInputs<TProfileData>)?.gender}
            {(inputs.profile as FormInputs<TProfileData>)?.dateOfBirth}
            {(inputs.profile as FormInputs<TProfileData>)?.address}
          </div>
        </div>

        {/* User Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">User Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {(inputs.profile as FormInputs<TProfileData>)?.bio}
            {(inputs.profile as FormInputs<TProfileData>)?.experience}

            {(inputs.profile as FormInputs<TProfileData>)?.specialties}
            {(inputs.profile as FormInputs<TProfileData>)?.fitnessGoals}
          </div>
        </div>

      </div>
    </ModalForm>

  </>
}

export default UserFormModal;
