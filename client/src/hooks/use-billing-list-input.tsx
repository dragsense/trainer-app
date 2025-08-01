// Services
import { IListParams } from "@/@types/api/param.type";
import { IBilling } from "@/@types/billing.type";
import { fetchBillings } from "@/services/billing.api";
import { useListInput } from "./use-list-input";

export interface UseBillingListInputProps {
  isSubmitting: boolean;
  multiple?: boolean;
  modal?: boolean;
  prefix?: string;
  valueType?: "string" | "number";
}

export function useBillingListInput({  isSubmitting, multiple = false, modal = false, prefix = "billing", valueType }: UseBillingListInputProps) {
  return useListInput<IBilling>({
    isSubmitting,
    multiple,
    placeholder: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    getKey: (billing) => billing.id.toString(),
    getLabel: (billing) => billing.localInvoiceNumber,
    storeKey: `${prefix}s`,
    queryFn: (params: IListParams) => fetchBillings(params),
    name: multiple ? `${prefix}Ids` : `${prefix}Id`,
    label: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    id: multiple ? `${prefix}Ids` : `${prefix}Id`,
    modal,
    valueType,
    searchType: "api",
  });
}
