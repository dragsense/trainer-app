// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { IReminder, TReminderData } from "@/@types/reminder.type";

// Constants
const REMINDERS_API_PATH = "/reminders";

export const me = async () =>
  apiRequest<IReminder>(`${REMINDERS_API_PATH}/me`, "GET");

export const createReminder = (data: Partial<TReminderData>) =>
    apiRequest<IReminder>(`${REMINDERS_API_PATH}`, "POST", data);

export const updateReminder = (id: number) => (data: Partial<TReminderData>) =>
    apiRequest<IMessageResponse>(
        `${REMINDERS_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const fetchReminders = (
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
    let apiPath = `${REMINDERS_API_PATH}`;
    return apiRequest<IPaginatedResponse<IReminder>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchReminder = (id: number) =>
    apiRequest<IReminder>(`${REMINDERS_API_PATH}/${id}`, "GET");

export const deleteReminder = (id: number) =>
    apiRequest<void>(`${REMINDERS_API_PATH}/${id}`, "DELETE");
