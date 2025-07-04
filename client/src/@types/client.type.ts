import { EClientStatus } from "./enums/client.enums";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: EClientStatus;
}
