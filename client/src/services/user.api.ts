// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { 
    IUser, 
    TResetPasswordDto, 
    TUserData, 
    IProfile, 
    TProfileData,
    IUserAvailability,
    TUpdateUserAvailabilityData,
    TCreateUserAvailabilityData
} from "@/@types/user.type";

// Constants
const USERS_API_PATH = "/users";
const PROFILES_API_PATH = USERS_API_PATH + "/profiles";
const AVAILABILITY_API_PATH = USERS_API_PATH + "/availability";

export const me = async () =>
    apiRequest<IUser>(`${USERS_API_PATH}/me`, "GET");


export const createUser = (data: Partial<TUserData>) =>
    apiRequest<{ user: IUser, message: string}>(`${USERS_API_PATH}`, "POST", data);

export const updateUser = (id: number) => (data: Partial<TUserData>) =>
    apiRequest<IMessageResponse>(
        `${USERS_API_PATH}/${id}`,
        "PUT",
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


export const fetchProfile = () =>
    apiRequest<IProfile>(`${PROFILES_API_PATH}/profile/me`, "GET");

export const updateProfile = (data: Partial<TProfileData>) =>
    apiRequest<IMessageResponse>(`${PROFILES_API_PATH}/profile/me`, "PATCH", data);

export const changePassword = (data: TResetPasswordDto) =>
    apiRequest<IMessageResponse>(`${USERS_API_PATH}/me/reset-password`, "PUT", data);

// Availability API functions
export const fetchMyAvailability = () =>
    apiRequest<IUserAvailability>(`${AVAILABILITY_API_PATH}/me`, "GET");

export const updateMyAvailability = (data: TUpdateUserAvailabilityData) =>
    apiRequest<IMessageResponse>(`${AVAILABILITY_API_PATH}/me`, "PUT", data);

export const fetchTrainerAvailabilities = () =>
    apiRequest<IUserAvailability[]>(`${AVAILABILITY_API_PATH}/trainers`, "GET");

export const fetchAvailableTrainers = (params: {
    date: string;
    startTime: string;
    endTime: string;
}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest<IUserAvailability[]>(`${AVAILABILITY_API_PATH}/trainers/available?${queryParams.toString()}`, "GET");
};

export const checkUserAvailability = (userId: number, params: {
    date: string;
    startTime: string;
    endTime: string;
}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest<{ available: boolean }>(`${AVAILABILITY_API_PATH}/check/${userId}?${queryParams.toString()}`, "GET");
};

export const fetchUserAvailability = (userId: number) =>
    apiRequest<IUserAvailability>(`${AVAILABILITY_API_PATH}/${userId}`, "GET");

export const updateUserAvailability = (userId: number) => (data: TUpdateUserAvailabilityData) =>
    apiRequest<IUserAvailability>(`${AVAILABILITY_API_PATH}/${userId}`, "PUT", data);

export const createUserAvailability = (userId: number, data: TCreateUserAvailabilityData) =>
    apiRequest<IUserAvailability>(`${AVAILABILITY_API_PATH}/${userId}`, "POST", data);

export const deleteUserAvailability = (userId: number) =>
    apiRequest<IMessageResponse>(`${AVAILABILITY_API_PATH}/${userId}`, "DELETE");
