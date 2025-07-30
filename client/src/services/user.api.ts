// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { IUser, TUserData } from "@/@types/user.type";

// Constants
const USERS_API_PATH = "/users";


export const me = async () =>
  apiRequest<IUser>(`${USERS_API_PATH}/me`, "GET");


export const createUser = (data: Partial<TUserData>) =>
    apiRequest<IUser>(`${USERS_API_PATH}`, "POST", data);

export const updateUser = (id: number) => (data: Partial<TUserData>) =>
    apiRequest<IMessageResponse>(
        `${USERS_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const fetchUsers = (
    params: IListParams,
    level?: number
) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (level) queryParams.append("level", level.toString());

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
    let apiPath = `${USERS_API_PATH}`;
    return apiRequest<IPaginatedResponse<IUser>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};



export const fetchUser = (id: number) =>
    apiRequest<IUser>(`${USERS_API_PATH}/${id}`, "GET");

export const deleteUser = (id: number) =>
    apiRequest<void>(`${USERS_API_PATH}/${id}`, "DELETE");
