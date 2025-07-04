export type Id = {
  id: number;
};

export interface IMessageResponse {
  message: string;
  [key: string]: any;
}

export type ItemActionProps = {
  itemName: string;
  action: string;
  extraAction?: string;
  id: number;
};



