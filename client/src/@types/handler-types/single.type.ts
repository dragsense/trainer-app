import { ItemActionProps } from "../general.type";

export interface ISingleBaseProps<TData> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  open: boolean;
  onItemAction: (action: ItemActionProps) => void;
}

