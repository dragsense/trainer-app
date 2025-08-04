import { IMessageResponse } from "../api/response.type";

export type TItemActionProps = {
  itemName: string;
  action: string;
  type?: string;
  id: number;
};


export type TActionComponentProps<T> = T & {
  storeKey: string;
  action: string;
};

export interface IActionComponent<TListActionProps = any> {
  action: string;
  comp: React.ComponentType<TActionComponentProps<TListActionProps>>;
}

export interface MutationFns<TFormData, TResponse> {
  deleteFn?: (id: number) => Promise<void>;
  updateFn?: (id: number) => (item: TFormData) => Promise<IMessageResponse>;
  createFn?: (
    item: Omit<TFormData, "id" | "createdAt" | "updatedAt">
  ) => Promise<TResponse>;
  onSuccess?: (
    action: string
  ) => (response: TResponse | IMessageResponse | void) => void;
}

export * from "./form.type";
export * from "./list.type";
export * from "./single.type";
