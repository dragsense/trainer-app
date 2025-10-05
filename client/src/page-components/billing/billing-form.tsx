
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TBillingData } from "@shared/types/billing.type";
import { IBilling } from "@shared/interfaces/billing.interface";
import { EBillingCurrency, EBillingStatus, EBillingType } from "@shared/enums/billing.enum";
import { EPaymentMethodType } from "@shared/enums/payment-method.enum";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { BillingFormModal } from "@/components/admin";

// Services
import { createBilling, updateBilling } from "@/services/billing.api";
import { IBillingFormExtraProps } from "@/components/admin/billings/form/billing-form-modal";
import { strictDeepMerge } from "@/utils";
import { CreateBillingDto, UpdateBillingDto } from "@shared/dtos";


interface IBillingFormProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, IBillingFormExtraProps>> {
}




export default function BillingForm({
    storeKey,
    store,
}: IBillingFormProps) {

    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, reset, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        reset: state.reset,
        extra: state.extra
    })));

    const INITIAL_VALUES: TBillingData = {
        stripeInvoiceId: "",
        type: EBillingType.INDIVIDUAL,
        status: EBillingStatus.PENDING,
        invoiceAmount: 0,
        currency: EBillingCurrency.USD,
        paymentMethodType: EPaymentMethodType.CASH,
        user: { id: 0, email: "" },
        sessionId: 0,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        lineItems: [{
            description: "",
            quantity: 0,
            unitPrice: 0,
            amount: 0,
            tax: 0,
        }],
        totalTax: 0,
        discount: 0,
        totalAmount: 0,
        notes: "",
        terms: "",
    };

    const initialValues = strictDeepMerge<TBillingData>(INITIAL_VALUES, response ?? {});

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleClose = () => {
        reset();
        setAction('none');
    };

    const isEditing = !!response?.id;
    const mutationFn = isEditing ? updateBilling(response.id) : createBilling;
    const dto = isEditing ? UpdateBillingDto : CreateBillingDto;

    return <>
        <FormHandler<TBillingData, IMessageResponse, IBillingFormExtraProps>
            mutationFn={mutationFn}
            FormComponent={BillingFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
                
            }}
        />
    </>

}
