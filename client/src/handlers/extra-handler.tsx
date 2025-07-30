import React from "react";

import { ItemActionProps } from "@/@types/general.type";
import { ExtraComponentProps, IExtraComponent } from "@/@types/handler-types";



interface ExtraComponentRendererProps<TListExtraProps> {
  extraComponents?: IExtraComponent<TListExtraProps>[];
  itemAction: ItemActionProps | null;
  setItemAction: React.Dispatch<React.SetStateAction<ItemActionProps | null>>;
  listProps: TListExtraProps;
  handleInvalidateQuery: (res: unknown) => void;
}

const useExtraComponentsMap = <TListExtraProps,>(
  components: IExtraComponent<TListExtraProps>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.trigerAction] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<ExtraComponentProps<TListExtraProps>>>);
  }, [components]);
};

export const ExtraComponentHandler = <TListExtraProps,>({
  extraComponents,
  itemAction,
  setItemAction,
  listProps,
  handleInvalidateQuery,
}: ExtraComponentRendererProps<TListExtraProps>) => {
  const extraComponentsMap = useExtraComponentsMap(extraComponents);
  const currentAction = itemAction?.extraAction;

  return React.useMemo(() => {
    if (!currentAction || !extraComponentsMap) return null;

    const ExtraComp = extraComponentsMap[currentAction];

    if (!ExtraComp) return null;

    return (
      <ExtraComp
        key={`extra-comp-${currentAction}`}
        handleInvalidateQuery={handleInvalidateQuery}
        {...listProps}
      />
    );
  }, [currentAction, extraComponentsMap, itemAction, setItemAction, listProps]);
};