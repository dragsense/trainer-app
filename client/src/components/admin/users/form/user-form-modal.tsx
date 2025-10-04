
// External Libraries
import React from "react";
import { Loader2, Plus, X } from "lucide-react";
// Custom Hooks
import { FormInputs, useInput } from "@/hooks/use-input";

// Types
import { TFieldConfigObject } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TUserData } from "@shared/types/user.type";
import { TUserResponse } from "@shared/interfaces/user.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { THandlerComponentProps } from "@/@types/handler-types";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { CreateUserDto } from "@shared/dtos";


export interface IUserFormModalExtraProps {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
  level: number;
}

interface IUserFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUserData, TUserResponse, IUserFormModalExtraProps>> {
}

const UserFormModal = React.memo(function UserFormModal({
  storeKey,
  store,
}: IUserFormModalProps) {


  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const open = store((state) => state.extra.open)
  const isEditing = store((state) => state.extra.isEditing)
  const onClose = store((state) => state.extra.onClose)

  const fields: TFieldConfigObject<TUserData> = dtoToFields(CreateUserDto, {
    profile: {
      addresses: {
        minItems: 1,
        maxItems: 10,
        AddButton: (props: any) => <Button {...props}><Plus /></Button>,
        RemoveButton: (props: any) => <Button {...props}><X /></Button>,
        renderItem: (items: any, 
          AddButton: React.ReactNode, 
          removeButton: (index: number) => React.ReactNode) => (
          items.map((item: TUserData['profile']['addresses'][number], index: number) => {
            return (
              <div className="flex items-end gap-2" key={index}>
                {item.address}
                {index === items.length - 1 ?
                  AddButton : removeButton(index)
                }
              </div>
            );
          })
        )
      }
    }
  })

  const inputs: FormInputs<TUserData> = useInput<TUserData>({
    fields,
    showRequiredAsterisk: true,
  });

  const onOpenChange = (state: boolean) => {
    if (state === false)
      onClose();
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


  const profileInputs = inputs.profile || {};

  return <>
    <ModalForm<TUserData, TUserResponse, IUserFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} User`}
      description={`${isEditing ? "Edit" : "Add a new"} User`}
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
            {inputs.email}
            {inputs.isActive}
            {profileInputs.firstName}
            {profileInputs.lastName}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-semibold  mb-3">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {profileInputs.phoneNumber}

            {profileInputs.gender}
            {profileInputs.dateOfBirth}
            {profileInputs.address}
          </div>
        </div>

        {/* User Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3">User Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {profileInputs.bio}
            {profileInputs.experience}

            {profileInputs.specialties}
            {profileInputs.fitnessGoals}
            {profileInputs.image as React.ReactNode}
            {profileInputs.addresses}


          </div>
        </div>

      </div>
    </ModalForm>

  </>
});

export default UserFormModal;
