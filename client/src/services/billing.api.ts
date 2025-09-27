// Utils
import { apiFileRequest, apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import { IListQueryParams } from "@shared/interfaces/api/param.interface";
import { TBillingData, TUpdateBillingStatusData } from "@shared/types/billing.type";
import { IBilling } from "@shared/interfaces/billing.interface";

// Constants
const BILLINGS_API_PATH = "/billings";

export const me = async () =>
    apiRequest<IBilling>(`${BILLINGS_API_PATH}/me`, "GET");

export const createBilling = (data: Partial<TBillingData>) =>
    apiRequest<IMessageResponse>(`${BILLINGS_API_PATH}`, "POST", data);

export const updateBilling = (id: number) => (data: Partial<TBillingData>) =>
    apiRequest<IMessageResponse>(
        `${BILLINGS_API_PATH}/${id}`,
        "PATCH",
        data
    );


export const updateBillingStatus = (id: number) => (data: TUpdateBillingStatusData) => {
    const formData = new FormData();


    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item instanceof File || item instanceof Blob) {
                    formData.append(`${key}[]`, item);
                } else {
                    formData.append(`${key}[]`, String(item));
                }
            });
        } else if (value instanceof File || value instanceof Blob) {
            formData.append(key, value); 
        } else {
            formData.append(key, String(value));
        }
    });

    return apiFileRequest<IMessageResponse>(
        `${BILLINGS_API_PATH}/${id}/status`,
        "PATCH",
        formData
    );

}

export const fetchBillings = (
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
    let apiPath = `${BILLINGS_API_PATH}`;
    return apiRequest<IPaginatedResponse<IBilling>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchBilling = (id: number) =>
    apiRequest<IBilling>(`${BILLINGS_API_PATH}/${id}`, "GET");

export const deleteBilling = (id: number) =>
    apiRequest<void>(`${BILLINGS_API_PATH}/${id}`, "DELETE");



export const fetchStripeInvoices = (params?: { limit?: number; customerId?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.customerId) queryParams.append("customerId", params.customerId);
    if (params?.status) queryParams.append("status", params.status);

    return apiRequest<any>(
        `${BILLINGS_API_PATH}/stripe/invoices?${queryParams.toString()}`,
        "GET"
    );
};



export const fetchStripeCharges = (params?: { limit?: number; customerId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.customerId) queryParams.append("customerId", params.customerId);

    return apiRequest<any>(
        `${BILLINGS_API_PATH}/stripe/transactions/charges?${queryParams.toString()}`,
        "GET"
    );
};
