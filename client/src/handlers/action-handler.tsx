import React from "react";

// Types
import { TActionComponentProps, IActionComponent } from "@/@types/handler-types";
import { useStore } from "zustand";
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";


interface ActionComponentRendererProps<TListActionProps> {
  extraComponents?: IActionComponent<TListActionProps>[];
  storeKey: string;
  listProps: TListActionProps;
}

const useActionComponentsMap = <TListActionProps,>(
  components: IActionComponent<TListActionProps>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.action] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<TActionComponentProps<TListActionProps>>>);
  }, [components]);
};

export const ActionComponentHandler = <IData, TListActionProps,>({
  extraComponents,
  storeKey,
  listProps
}: ActionComponentRendererProps<TListActionProps>) => {

  const extraComponentsMap = useActionComponentsMap(extraComponents);

  const singleStoreKey = storeKey + "-single";
  const singleStore = useRegisteredStore<TSingleHandlerStore<IData>>(singleStoreKey);

  if (!singleStore) {
    return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const action = useStore(singleStore, state => state.action);


  return React.useMemo(() => {
    if (!action || !extraComponentsMap) return null;

    const ActionComp = extraComponentsMap[action];

    if (!ActionComp) return null;


    return (
      <ActionComp
        key={`action-comp-${action}`}
        storeKey={storeKey}
        action={action}
        {...listProps}
      />
    );
  }, [action, singleStoreKey, listProps]);
};