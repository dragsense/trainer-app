// External Libraries
import { ReactNode } from "react";

// Components
import { Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TUpdateProfileData } from "@shared/types/user.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Stores
import { TFormHandlerStore } from "@/stores";

// Custom Components
import ProfileImageUpload from "@/components/shared-ui/profile-image-upload";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { AppCard } from "@/components/layout-ui/app-card";
import { THandlerComponentProps } from "@/@types/handler-types";

interface IProfileCardFormProps extends THandlerComponentProps<TFormHandlerStore<TUpdateProfileData, IMessageResponse>> {
}

export default function ProfileCardForm({ storeKey, store }: IProfileCardFormProps) {

    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const isSubmitting = store(state => state.isSubmitting);


    const fields: TFieldConfig<TUpdateProfileData>[] = [
        // ─── Profile Image ──────────────
        {
            id: "image",
            name: "image",
            label: "Profile Image",
            type: "custom",
            required: false,
            Component: (props) => <ProfileImageUpload {...props} />,
        },

        // ─── Basic Info ──────────────
        {
            id: "firstName",
            name: "firstName",
            label: "First Name",
            placeholder: "Enter your first name",
            type: "text",
            required: true,
        },
        {
            id: "lastName",
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter your last name",
            type: "text",
            required: true,
        },
        {
            id: "phoneNumber",
            name: "phoneNumber",
            label: "Phone Number",
            placeholder: "Enter your phone number",
            type: "tel",
            required: false,
        },
        {
            id: "address",
            name: "address",
            label: "Address",
            placeholder: "Enter your address",
            type: "textarea",
            required: false,
        },

        // ─── Bio & Professional Info ─────
        {
            id: "bio",
            name: "bio",
            label: "Bio",
            placeholder: "Tell us about yourself...",
            type: "textarea",
            required: false,
        },
        {
            id: "fitnessGoals",
            name: "fitnessGoals",
            label: "Fitness Goals",
            placeholder: "Enter your fitness goals (comma-separated)",
            type: "text",
            required: false,
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: false,
    });

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
                        {inputs.slice(0, 1)}
                    </div>

                    {/* Basic Information Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inputs.slice(1, 5)}
                        </div>
                    </div>

                    {/* Bio & Goals Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">About You</h3>
                        <div className="space-y-4">
                            {inputs.slice(5)}
                        </div>
                    </div>
                </div>

            
        </AppCard>
        </Form>
    );
}