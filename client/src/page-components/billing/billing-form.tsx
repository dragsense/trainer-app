
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field-config.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TBillingData } from "@shared/types/billing.type";
import { IBilling } from "@shared/interfaces/billing.interface";
import { EBillingCurrency, EBillingStatus, EBillingType } from "@shared/enums/billing.enum";
import { EPaymentMethodType } from "@shared/enums/payment-method.enum";

// Store
import { TFormHandlerStore, TSingleHandlerStore } from "@/stores";

// Components
import { BillingFormModal } from "@/components/admin";

// Services
import { createBilling, updateBilling } from "@/services/billing.api";
import { IBillingFormExtraProps } from "@/components/admin/billings/form/billing-form-modal";
import { useMemo } from "react";
import { extractValues } from "@/utils";
import { CreateBillingDto } from "@shared/dtos";


interface IBillingFormProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, IBillingFormExtraProps>> {
}




export default function BillingForm({
    storeKey,
    store,
}: IBillingFormProps) {

    const queryBilling = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TBillingData> = {
        stripeInvoiceId: { value: "" },
        type: { value: EBillingType.INDIVIDUAL },
        status: { value: EBillingStatus.PENDING },
        invoiceAmount: { value: 0 },
        currency: { value: EBillingCurrency.USD },
        paymentMethodType: { value: EPaymentMethodType.CASH },
        userId: { value: 0 },
        sessionId: { value: 0 },
        issueDate: { value: new Date() },
        dueDate: { value: new Date() },
        lineItems: {
            value: [{
                isNested: true,
                value: {
                    description: { value: "" },
                    quantity: { value: 0 },
                    unitPrice: { value: 0 },
                    amount: { value: 0 },
                    tax: { value: 0 },
                }
            }],
        },
        totalTax: { value: 0 },
        discount: { value: 0 },
        totalAmount: { value: 0 },
        notes: { value: "" },
        terms: { value: "" },
    };


    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }



    const { action, response, isLoading, setAction, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        extra: state.extra
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
            dto={CreateBillingDto}
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
