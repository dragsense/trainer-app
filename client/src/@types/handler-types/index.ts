import { IMessageResponse } from "../api/response.type";

export type TItemActionProps = {
  itemName: string;
  action: string;
  extraAction?: string;
  id: number;
};


export type ExtraComponentProps<T> = T & {
  handleInvalidateQuery: (res: unknown) => void;
};

export interface IExtraComponent<TListExtraProps = any> {
  trigerAction: string;
  comp: React.ComponentType<ExtraComponentProps<TListExtraProps>>;
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
