// React & Hooks


// Services
import { IListParams } from "@/@types/api/param.type";
import { IUser } from "@/@types/user.type";
import { fetchUsers } from "@/services/user.api";
import { useListInput } from "./use-list-input";

export interface UseUserListInputProps {
  isSubmitting: boolean;
  multiple?: boolean;
  modal?: boolean;
  level: number;
  prefix?: string;
  valueType?: "string" | "number";
}

export function useUserListInput({ level, isSubmitting, multiple = false, modal = false, prefix = "user", valueType }: UseUserListInputProps) {
  return useListInput<IUser>({
    isSubmitting,
    multiple,
    placeholder: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    getKey: (user) => user.id.toString(),
    getLabel: (user) => user.email,
    storeKey: `${prefix}s`,
    queryFn: (params: IListParams) => fetchUsers(params, level),
    name: multiple ? `${prefix}Ids` : `${prefix}Id`,
    label: multiple ? `Select ${prefix}s` : `Select ${prefix}`,
    id: multiple ? `${prefix}Ids` : `${prefix}Id`,
    modal,
    valueType,
    searchType: "api",
  });
}
