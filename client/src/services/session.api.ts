// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import { IListQueryParams } from "@shared/interfaces/api/param.interface";
import { ISession } from "@shared/interfaces/session.interface";
import { TSessionData } from "@shared/types/session.type";

// Constants
const SESSIONS_API_PATH = "/sessions";

export const me = async () =>
  apiRequest<ISession>(`${SESSIONS_API_PATH}/me`, "GET");

export const createSession = (data: TSessionData) =>
    apiRequest<IMessageResponse>(`${SESSIONS_API_PATH}`, "POST", data);

export const updateSession = (id: number) => (data: TSessionData) =>
    apiRequest<IMessageResponse>(
        `${SESSIONS_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const fetchSessions = (
    params: IListQueryParams
) => {
    const queryParams = new URLSearchParams();
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
    let apiPath = `${SESSIONS_API_PATH}`;
    return apiRequest<IPaginatedResponse<ISession>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchSession = (id: number) =>
    apiRequest<ISession>(`${SESSIONS_API_PATH}/${id}`, "GET");

export const deleteSession = (id: number) =>
    apiRequest<void>(`${SESSIONS_API_PATH}/${id}`, "DELETE");
