import React from "react";

// Types
import { THandlerComponentProps, IActionComponent } from "@/@types/handler-types";
import { TSingleHandlerStore } from "@/stores";



interface SingleActionComponentRendererProps<
  IData,
  TActionProps extends Record<string, any> = {}
> {
  actionComponents?: IActionComponent<TSingleHandlerStore<IData, TActionProps>>[];
  storeKey: string;
  store: TSingleHandlerStore<IData, TActionProps>;
}

const useActionComponentsMap = <IData, TActionProps extends Record<string, any> = {}>(
  components: IActionComponent<TSingleHandlerStore<IData, TActionProps>>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.action] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<THandlerComponentProps<TSingleHandlerStore<IData, TActionProps>>>>);
  }, [components]);
};

export const SingleActionComponentHandler = <
  IData,
  TActionProps extends Record<string, any> = {}
>({
  actionComponents,
  storeKey,
  store,
}: SingleActionComponentRendererProps<IData, TActionProps>) => {
  const actionComponentsMap = useActionComponentsMap<IData, TActionProps>(actionComponents);

  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const action = store((state) => state.action);


  return React.useMemo(() => {
    if (!action || !actionComponentsMap) return null;

    const ActionComp = actionComponentsMap[action];
    if (!ActionComp) return null;

    return (
      <ActionComp
        key={`action-comp-${action}-${storeKey}`}
        storeKey={storeKey}
        store={store}
      />
    );
  }, [action, actionComponentsMap, storeKey]);
};
