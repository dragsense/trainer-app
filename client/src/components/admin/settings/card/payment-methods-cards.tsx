import { Switch } from "@/components/ui/switch";
import { CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { IPaymentMethod } from "@/@types/setting.type";
import { useStore } from "zustand";
import { AppCard } from "@/components/layout-ui/app-card";
import { Button } from "@/components/ui/button";

interface PaymentMethodsCardsProps {
  storeKey: string;
}

const getPaymentMethodIcon = (key: PaymentMethodType) => {
  switch (key) {
    case PaymentMethodType.CASH:
      return <DollarSign className="h-6 w-6 text-green-600" />;
    case PaymentMethodType.STRIPE:
      return <CreditCard className="h-6 w-6 text-blue-600" />;
    default:
      return <DollarSign className="h-6 w-6 text-green-600" />;
  }
};

export default function PaymentMethodsCards({
  storeKey
}: PaymentMethodsCardsProps) {


  const listStoreKey = storeKey + "-list";
  const singelStoreKey = storeKey + "-single";

  const listStore = useRegisteredStore<TListHandlerStore<IPaymentMethod>>(listStoreKey);

  if (!listStore) {
    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<IPaymentMethod>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }


  const { response: data, isLoading, error, setItemAction } = useStore(listStore);


  const handleConfigureMethod = (method: IPaymentMethod) => {
    setItemAction({
      itemName: "PaymentMethod",
      action: "configurePaymentMethod",
      id: method.id,
    });
  };

  const handleToggleMethod = (method: IPaymentMethod) => {
    setItemAction({
      itemName: "PaymentMethod",
      action: "togglePaymentMethod",
      id: method.id,
    });
  };

  const extraActions = (method: IPaymentMethod) => {
    if (!method.configSchema) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleConfigureMethod(method)}
      >
        <Settings className="h-4 w-4 mr-2" />
        Configure
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {data?.map((method) => (
          <AppCard key={method.id} className="overflow-hidden"

            header={
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getPaymentMethodIcon(method.key)}
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <p className="text-sm text-gray-500">Type: {method.key}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">

                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`enabled-${method.id}`} className="text-sm text-gray-500">
                        Enabled
                      </Label>
                      <Switch
                        id={`enabled-${method.id}`}
                        disabled={method.key === PaymentMethodType.CASH}
                        checked={method.isEnabled || false}
                        onCheckedChange={() => handleToggleMethod(method)}
                      />
                    </div>
                    {extraActions(method)}
                  </div>

                </div>
              </>
            }>
            {null}
          </AppCard>
        ))}
      </div>

      {data?.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods found</h3>
          <p className="text-gray-500">No payment methods are currently available.</p>
        </div>
      )}
    </div>
  );
} 