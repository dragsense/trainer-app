// React & Hooks


// Services
import { IListParams } from "@/@types/api/param.type";
import { ISession } from "@/@types/session.type";
import { fetchSessions } from "@/services/session.api";
import { useListInput } from "./use-list-input";

export interface UseSessionListInputProps {
  isSubmitting: boolean;
  multiple?: boolean;
  modal?: boolean;
  prefix?: string;
  valueType?: "string" | "number";
}

export function useSessionListInput({  isSubmitting, multiple = false, modal = false, prefix = "session", valueType }: UseSessionListInputProps) {
  return useListInput<ISession>({
    isSubmitting,
    multiple,
    placeholder: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    getKey: (session) => session.id.toString(),
    getLabel: (session) => session.title,
    storeKey: `${prefix}s`,
    queryFn: (params: IListParams) => fetchSessions(params),
    name: multiple ? `${prefix}Ids` : `${prefix}Id`,
    label: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    id: multiple ? `${prefix}Ids` : `${prefix}Id`,
    modal,
    valueType,
    searchType: "api",
  });
}
