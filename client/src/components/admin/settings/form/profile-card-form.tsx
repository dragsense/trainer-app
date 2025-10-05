// External Libraries
import React, { ReactNode } from "react";

// Components
import { Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { FormInputs, useInput } from "@/hooks/use-input";

// Types
import { TFieldConfigObject, TFieldConfigObjectPartial } from "@/@types/form/field-config.type";
import { TUpdateProfileData } from "@shared/types/user.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Stores
import { TFormHandlerStore } from "@/stores";

// Custom Components
import ProfileImageUpload from "@/components/shared-ui/profile-image-upload";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { AppCard } from "@/components/layout-ui/app-card";
import { THandlerComponentProps } from "@/@types/handler-types";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { UpdateProfileDto } from "@shared/dtos";

interface IProfileCardFormProps extends THandlerComponentProps<TFormHandlerStore<TUpdateProfileData, IMessageResponse>> {
}

const ProfileCardForm = React.memo(function ProfileCardForm({ storeKey, store }: IProfileCardFormProps) {

    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const isSubmitting = store(state => state.isSubmitting);

    const fields = dtoToFields(UpdateProfileDto, {
        image: {
            type: "nested",
            subFields: [
                {
                    id: "path",
                    name: "path",
                    label: "Profile Image",
                    type: "custom",
                    required: false,
                    Component: (props) => <ProfileImageUpload {...props} />,
                },
            ],
        }
    }) as TFieldConfigObject<TUpdateProfileData>;

    const inputs = useInput<TUpdateProfileData>({
        fields,
        showRequiredAsterisk: false,
    }) as FormInputs<TUpdateProfileData>;

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
        </div>
    );

    return (
        <Form formStore={store}>
            <AppCard
                header={
                    <>
                        <h2 className="text-md font-semibold">Update Profile</h2>
                        <p className="text-sm text-muted-foreground">Manage your personal information</p>
                    </>
                }
                footer={footerContent}
            >

                <div className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex justify-center">
                        {inputs.image}
                    </div>

                    {/* Basic Information Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inputs.firstName}
                            {inputs.lastName}
                            {inputs.phoneNumber}
                            {inputs.address}
                        </div>
                    </div>

                    {/* Bio & Goals Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">About You</h3>
                        <div className="space-y-4">
                            {inputs.bio}
                            {inputs.fitnessGoals}
                        </div>
                    </div>
                </div>
            </AppCard>
        </Form>
    );
});

export default ProfileCardForm;