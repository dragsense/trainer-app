import React from "react";

// Types
import { TExtraComponentProps, IExtraComponent } from "@/@types/handler-types";

// Stores
import { TListHandlerStore } from "@/stores";
import { useStore } from "zustand";



interface ExtraComponentRendererProps<T, TListExtraProps> {
  extraComponents?: IExtraComponent<TListExtraProps>[];
  store: TListHandlerStore<T>;
  storeKey: string;
  listProps: TListExtraProps;
  handleInvalidateQuery: (res: unknown) => void;
}

const useExtraComponentsMap = <TListExtraProps,>(
  components: IExtraComponent<TListExtraProps>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.triggerAction] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<TExtraComponentProps<TListExtraProps>>>);
  }, [components]);
};

export const ExtraComponentHandler = <T, TListExtraProps>({
  extraComponents,
  store,
  listProps,
  storeKey,
  handleInvalidateQuery,
}: ExtraComponentRendererProps<T, TListExtraProps>) => {

  const extraComponentsMap = useExtraComponentsMap(extraComponents);

  const { itemAction, setItemAction } = useStore(store);

  const currentAction = itemAction?.action;

  return React.useMemo(() => {
    if (!currentAction || !extraComponentsMap) return null;

    const ExtraComp = extraComponentsMap[currentAction];

    if (!ExtraComp) return null;

    return (
      <ExtraComp
        key={`extra-comp-${currentAction}`}
        storeKey={storeKey}
        handleInvalidateQuery={handleInvalidateQuery}
        {...listProps}
      />
    );
  }, [currentAction, extraComponentsMap, itemAction, setItemAction, listProps]);
};