// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { PaymentMethodConfigForm, PaymentMethodEnabledToggle } from "@/page-components";
import { PaymentMethodsCards } from "@/components/admin";

// API
import { fetchPaymentMethods } from "@/services/setting.api";

// Types
import { IPaymentMethod } from "@/@types/setting.type";

// Layouts
import { PageInnerLayout } from "@/layouts";


export default function PaymentMethodsPage() {


    const STORE_KEY = 'paymentMethod';

    return (
            <SingleHandler<IPaymentMethod[]>
                queryFn={fetchPaymentMethods}
                storeKey={STORE_KEY}
                SingleComponent={PaymentMethodsCards}
                actionComponents={[
                    {
                        action: "togglePaymentMethod",
                        comp: PaymentMethodEnabledToggle
                    },
                    {
                        action: "configurePaymentMethod",
                        comp: PaymentMethodConfigForm
                    }
                ]}
                enabled={true}
            />


    );
}



const Header = () => null;
