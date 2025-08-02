// React & Hooks
import { useEffect, useState } from "react";

// Types
import { IPaginatedResponse } from "@/@types/api/response.type";
import { TCustomInputWrapper, TFieldConfig } from "@/@types/form/field.type";
import { IListParams } from "@/@types/api/param.type";

// Components
import { AppComboBox } from "@/components/layout-ui/app-combo-box";

// Hooks
import {  useApiQuery } from "@/hooks/use-api-query";

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
    valueType?: "string" | "number";
    modal?: boolean;
    searchType?: "local" | "api";
    disabled?: boolean;
}

export function useListInput<T>({
    isSubmitting,
    multiple = false,
    placeholder = "Select...",
    getKey,
    getLabel,
    storeKey,
    queryFn,
    valueType,
    name,
    disabled,
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
            valueType,
            required: true,
            disabled,
            className: "w-full",
            Component: ({ value, onChange, disabled }) => (
                <ListInputWrapper<T>
                    value={value}
                    onChange={onChange}
                    disabled={isSubmitting || disabled}
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
    disabled?: boolean;
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
    disabled = false,
    searchType = "local",
}: ListInputWrapperProps<T>) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Use API query to fetch data with search
    const { data: response, isLoading, error } = useApiQuery({
        queryKey: [storeKey, { search: debouncedSearch }],
        queryFn: () => queryFn({
            search: debouncedSearch,
            page: 1,
            limit: 50,
        }),
        options: {
            enabled: true,
        }
    });

    const data = response?.data || [];


    return (
        <AppComboBox<T>
            value={multiple ? (value || []) : value?.toString() || ""}
            onChange={onChange}
            items={data}
            loading={isLoading}
            error={error?.message || null}
            getLabel={getLabel}
            getKey={getKey}
            onSearchChange={setSearch}
            placeholder={placeholder}
            multiple={multiple}
            modal={modal}
            searchType={searchType}
            disabled={disabled}
        />
    );
};