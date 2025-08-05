// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { IBilling, TBillingData } from "@/@types/billing.type";

// Constants
const SESSIONS_API_PATH = "/billings";

export const me = async () =>
  apiRequest<IBilling>(`${SESSIONS_API_PATH}/me`, "GET");

export const createBilling = (data: Partial<TBillingData>) =>
    apiRequest<IMessageResponse>(`${SESSIONS_API_PATH}`, "POST", data);

export const updateBilling = (id: number) => (data: Partial<TBillingData>) =>
    apiRequest<IMessageResponse>(
        `${SESSIONS_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const fetchBillings = (
    params: IListParams
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
    return apiRequest<IPaginatedResponse<IBilling>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchBilling = (id: number) =>
    apiRequest<IBilling>(`${SESSIONS_API_PATH}/${id}`, "GET");

export const deleteBilling = (id: number) =>
    apiRequest<void>(`${SESSIONS_API_PATH}/${id}`, "DELETE");