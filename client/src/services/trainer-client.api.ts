// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { ITrainerClient, TTrainerClientData } from "@/@types/trainer.type";

// Constants
const TRAINER_CLIENTS_API_PATH = "/trainer-clients";

export const assignTrainerToClient = (data: TTrainerClientData) =>
    apiRequest<ITrainerClient>(`${TRAINER_CLIENTS_API_PATH}/assign`, "POST", data);

export const fetchAllAssignments = () =>
    apiRequest<ITrainerClient[]>(`${TRAINER_CLIENTS_API_PATH}`, "GET");

export const fetchTrainerClients = (trainerId: number) =>
    apiRequest<ITrainerClient[]>(`${TRAINER_CLIENTS_API_PATH}/trainer/${trainerId}/clients`, "GET");

export const fetchClientTrainers = (clientId: number) =>
    apiRequest<ITrainerClient[]>(`${TRAINER_CLIENTS_API_PATH}/client/${clientId}/trainers`, "GET");

export const removeAssignment = (id: number) =>
    apiRequest<IMessageResponse>(`${TRAINER_CLIENTS_API_PATH}/${id}`, "DELETE");

export const removeTrainerFromClient = (trainerId: number, clientId: number) =>
    apiRequest<IMessageResponse>(`${TRAINER_CLIENTS_API_PATH}/trainer/${trainerId}/client/${clientId}`, "DELETE");
