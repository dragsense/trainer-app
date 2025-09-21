
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
import { THandlerComponentProps } from "@/@types/handler-types";
import { IBilling, TBillingData } from "@/@types/billing.type";
import { BillingCurrency, BillingStatus, BillingType } from "#/modules/v1/billings/enums/billing.enum";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";

// Store
import { TFormHandlerStore, TSingleHandlerStore } from "@/stores";

// Components
import { BillingFormModal } from "@/components/admin";

// Services
import { createBilling, updateBilling } from "@/services/billing.api";
import { IBillingFormExtraProps } from "@/components/admin/billings/form/billing-form-modal";
import { useMemo } from "react";
import { extractValues } from "@/utils";




// Schema
export const LineItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price cannot be negative"),
    amount: z.number().min(0, "Amount cannot be negative"),
    tax: z.number().min(0, "Tax cannot be negative").optional(),
}).superRefine((data, ctx) => {
    const expectedAmount = data.quantity * data.unitPrice;
    if (data.amount !== expectedAmount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amount"],
            message: `Amount must equal quantity × unitPrice (${expectedAmount})`,
        });
    }
});

export const BillingSchema = z.object({
    type: z.nativeEnum(BillingType),
    status: z.nativeEnum(BillingStatus).optional(),
    currency: z.nativeEnum(BillingCurrency).optional(),
    paymentMethodType: z.nativeEnum(PaymentMethodType),
    userId: z.number().min(1, "User is required"),
    issueDate: z.date().optional(),
    dueDate: z
        .date()
        .optional()
        .refine(
            (date) => !date || date > new Date(),
            { message: "Due date must be in the future" }
        ),
    lineItems: z.array(LineItemSchema).min(1, "At least one line item is required"),
    totalTax: z.number().optional(),
    discount: z.number().optional(),
    notes: z.string().optional(),
    terms: z.string().optional(),
});


interface IBillingFormProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, IBillingFormExtraProps>> {
}




export default function BillingForm({
    storeKey,
    store,
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
        sessionId: { value: 0 },
        issueDate: { value: new Date() },
        dueDate: { value: new Date() },
        lineItems: { value: [], isNested: true },
        totalTax: { value: 0 },
        discount: { value: 0 },
        totalAmount: { value: 0 },
        notes: { value: "" },
        terms: { value: "" },
    };


    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

  

    const { action, response, isLoading, setAction } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction
    })));



    const initialValues = useMemo(() => {
        return extractValues(response, INITIAL_VALUES);
    }, [response]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleClose = () => {
        setAction('none');
    };

    return <>
        <FormHandler<TBillingData, IMessageResponse, IBillingFormExtraProps>
            mutationFn={response?.id ? updateBilling(response.id) : createBilling}
            FormComponent={BillingFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={BillingSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryBilling.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
                isEditing: response?.id ? true : false,
            }}
        />

    </>

}
