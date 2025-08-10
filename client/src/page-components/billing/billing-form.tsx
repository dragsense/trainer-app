
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IBilling, TBillingData } from "@/@types/billing.type";
import { BillingCurrency, BillingStatus, BillingType } from "#/modules/v1/billings/enums/billing.enum";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { BillingFormModal } from "@/components/admin";

// Services
import { createBilling, updateBilling } from "@/services/billing.api";




// Schema
export const LineItemSchema = z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
    tax: z.number().optional(),
});

export const BillingSchema = z.object({
    stripeInvoiceId: z.string().optional(),
    type: z.nativeEnum(BillingType),
    status: z.nativeEnum(BillingStatus).optional(),
    invoiceAmount: z.number().optional(),
    currency: z.nativeEnum(BillingCurrency).optional(),
    paymentMethodType: z.nativeEnum(PaymentMethodType),
    userId: z.number().min(1, "User is required"),
    sessionId: z.number().optional(),
    issueDate: z.date().optional(),
    dueDate: z
        .date()
        .optional()
        .refine(
            (date) => !date || date > new Date(),
            { message: "Due date must be in the future" }
        ),
    lineItems: z.array(LineItemSchema).min(1, "At least one line item is required").optional(),
    totalTax: z.number().optional(),
    discount: z.number().optional(),
    totalAmount: z.number().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
});


interface IBillingFormProps extends TActionComponentProps<any> {
}


interface IBillingFormExtraProps {
    open: boolean,
    onClose: () => void,
    isEditing?: boolean
}

export default function BillingForm({
    storeKey
}: IBillingFormProps) {

    const queryBilling = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TBillingData> = {
        stripeInvoiceId: { value: "" },
        type: { value: BillingType.INDIVIDUAL },
        status: { value: BillingStatus.PENDING },
        invoiceAmount: { value: 0 },
        currency: { value: BillingCurrency.USD },
        paymentMethodType: { value: PaymentMethodType.CASH },
        userId: { value: 0 },
        sessionId: { value: undefined },
        issueDate: { value: new Date() },
        dueDate: { value: new Date() },
        lineItems: { value: [] },
        totalTax: { value: 0 },
        discount: { value: 0 },
        totalAmount: { value: 0 },
        notes: { value: "" },
        terms: { value: "" },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, reset } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset
    })));

    const isEditing = !!response;

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            ...(response || {}),
            ...(response?.session ? { sessionId: response.session.id } : {}),
            ...(response?.user ? { userId: response.user.id } : {}),
        };


        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (flatResponse as any)[key];
                    return [
                        key,
                        {
                            ...original,
                            value: newValue !== undefined ? newValue : original.value,
                        },
                    ];
                })
            ),

        };


        return updatedValues;
    };

    const initialValues = getInitialValues();

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }



    return <>
        <FormHandler<TBillingData, IMessageResponse, IBillingFormExtraProps>
            mutationFn={isEditing ? updateBilling(response.id) : createBilling}
            FormComponent={BillingFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={BillingSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryBilling.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                open: !!action,
                onClose: reset,
                isEditing,
            }}
        />

    </>

}
