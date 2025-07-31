// React & Hooks
import { useState } from "react";

// Types
import { IPaginatedResponse } from "@/@types/api/response.type";
import { TCustomInputWrapper, TFieldConfig } from "@/@types/form/field.type";


// Handlers
import { ListHandler } from "@/handlers";

// Services
import { IListParams } from "@/@types/api/param.type";
import { AppComboBox } from "@/components/layout-ui/app-combo-box";
import { TListHandlerStore, useRegisteredStore } from "@/stores";
import { useStore } from "zustand";
import { z } from "zod";

export interface UseListInputProps<T> {
    isSubmitting: boolean;
    multiple?: boolean;
    placeholder?: string;
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    storeKey: string;
    queryFn: (params: IListParams) => Promise<IPaginatedResponse<T>>;
    name?: string;
    label?: string;
    id?: string;
    modal?: boolean;
    searchType?: "local" | "api";
}

export function useListInput<T>({
    isSubmitting,
    multiple = false,
    placeholder = "Select...",
    getKey,
    getLabel,
    storeKey,
    queryFn,
    name,
    label,
    id,
    modal = false,
    searchType = "local",
}: UseListInputProps<T>) {
    const field: TFieldConfig[] = [
        {
            id: id || (multiple ? "itemIds" : "itemId"),
            name: name || (multiple ? "itemIds" : "itemId"),
            label: label || placeholder,
            placeholder: placeholder || "Select...",
            type: "custom",
            required: true,
            className: "w-full",
            Component: ({ value, onChange }) => (
                <ListInputWrapper<T>
                    value={value}
                    onChange={onChange}
                    disabled={isSubmitting}
                    multiple={multiple}
                    placeholder={placeholder}
                    getKey={getKey}
                    getLabel={getLabel}
                    storeKey={storeKey}
                    queryFn={queryFn}
                    modal={modal}
                    searchType={searchType}
                />
            ),
        },
    ];
    return field;
}

interface ListInputWrapperProps<T> extends TCustomInputWrapper {
    multiple?: boolean;
    placeholder?: string;
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    storeKey: string;
    queryFn: (params: IListParams) => Promise<IPaginatedResponse<T>>;
    modal?: boolean;
    searchType?: "local" | "api";
}

export const ListInputWrapper = <T,>({
    value,
    onChange,
    storeKey,
    multiple = false,
    placeholder,
    getKey,
    getLabel,
    queryFn,
    modal = false,
    searchType = "local",
}: ListInputWrapperProps<T>) => {
    const [search, setSearch] = useState("");
    return (
        <ListHandler<T>
            storeKey={storeKey}
            queryListFn={(params) => queryFn({ ...params, filters: { search } })}
            ListComponent={({ storeKey }) => {

                const listStoreKey = storeKey + "-list";

                const listStore = useRegisteredStore<TListHandlerStore<T>>(listStoreKey);

                if (!listStore) {
                    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
                }


                const {
                    response: data,
                    isLoading: loading,
                    error } = useStore(listStore);

                return <AppComboBox<T>
                    value={multiple ? (value || []) : value}
                    onChange={onChange}
                    items={data || []}
                    loading={loading}
                    error={error?.message || null}
                    getLabel={getLabel}
                    getKey={getKey}
                    onSearchChange={setSearch}
                    placeholder={placeholder}
                    multiple={multiple}
                    modal={modal}
                    searchType={searchType}

                />
            }
            }
            queryFn={() => new Promise(() => { })}
            SingleComponent={() => null}
            FormComponent={() => null}
            initialValues={{}}
            validationSchema={z.object({})}


        />
    );
};