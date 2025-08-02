// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { TTrainerClientData, ITrainerClient } from "@/@types/trainer-client.type";

// Constants
const TRAINER_CLIENTS_API_PATH = "/trainer-clients";

export const assignTrainerToClient = (data: Partial<TTrainerClientData>) =>
  apiRequest<IMessageResponse>(`${TRAINER_CLIENTS_API_PATH}`, "POST", data);

export const fetchTrainerClients = (params?: IListParams, filterBy?: { trainerId?: number; clientId?: number }) => {
  if (!params) {
    return apiRequest<IPaginatedResponse<ITrainerClient>>(`${TRAINER_CLIENTS_API_PATH}`, "GET");
  }

  const queryParams = new URLSearchParams();

  if (filterBy) {
    if (filterBy.trainerId) {
      queryParams.append("trainerId", filterBy.trainerId.toString());
    }
    if (filterBy.clientId) {
      queryParams.append("clientId", filterBy.clientId.toString());
    }
  }

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  if (
    params.filters &&
    typeof params.filters === "object" &&
    Object.keys(params.filters).length > 0
  ) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  return apiRequest<IPaginatedResponse<ITrainerClient>>(
    `${TRAINER_CLIENTS_API_PATH}?${queryParams.toString()}`,
    "GET"
  );
};

export const fetchTrainerClientById = (id: number) =>
  apiRequest<ITrainerClient>(`${TRAINER_CLIENTS_API_PATH}/${id}`, "GET");

export const updateTrainerClient = (id: number) => (data: Partial<TTrainerClientData>) =>
  apiRequest<IMessageResponse>(`${TRAINER_CLIENTS_API_PATH}/${id}`, "PUT", data);

export const removeTrainerClientAssignment = (id: number) =>
  apiRequest<void>(`${TRAINER_CLIENTS_API_PATH}/${id}`, "DELETE");
