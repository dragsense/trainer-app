// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore } from "@/stores";
import { ISession } from "@shared/interfaces/session.interface";
import { TSessionData } from "@shared/types/session.type";
import { EBillingCurrency } from "@shared/enums/billing.enum";
import { EUserLevels, EUserRole } from "@shared/enums/user.enum";
import { IUser } from "@shared/interfaces/user.interface";
import { EPaymentMethodType } from "@shared/enums/payment-method.enum";
import { THandlerComponentProps } from "@/@types/handler-types";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";

export interface ISessionFormModalExtraProps {
  open: boolean;
  onClose: () => void;
  isEditing?: boolean;
  trainerId?: number;
}

interface ISessionFormModalProps extends THandlerComponentProps<TFormHandlerStore<TSessionData, IMessageResponse, ISessionFormModalExtraProps>> {
}

export default function SessionFormModal({
  storeKey,
  store,
}: ISessionFormModalProps) {

  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const open = store((state) => state.extra.open)
  const isEditing = store((state) => state.extra.isEditing)
  const onClose = store((state) => state.extra.onClose)
  const trainerId = store((state) => state.extra.trainerId)

  const users = useSearchableUsers({ level: EUserLevels[EUserRole.USER] })

  const UserSelect = ({ props, level, multiple = false }: { props: any; level: number; multiple?: boolean; }) => (
    <SearchableInputWrapper<IUser>
      {...props}
      modal={true}
      multiple={multiple}
      useSearchable={() => useSearchableUsers({ level })}
      getLabel={(item) => `${item.profile?.firstName} ${item.profile?.lastName} (${item.email})`}
      getKey={(item) => item.id.toString()}
      shouldFilter={false}
    />
  );

  const fields: TFieldConfig<TSessionData>[] = [
    // ─── Session Basic Info ──────────────
    {
      id: "title",
      name: "title",
      label: "Session Title",
      placeholder: "Personal Training Session",
      type: "text",
      required: true,
    },
    {
      id: "type",
      name: "type",
      label: "Session Type",
      type: "select",
      options: [
        { value: "ONE_ON_ONE", label: "One-on-One" },
        { value: "GROUP", label: "Group" },
        { value: "WORKSHOP", label: "Workshop" },
        { value: "ASSESSMENT", label: "Assessment" },
      ],
      required: true,
    },
    {
      id: "dateTime",
      name: "dateTime",
      label: "Start Date & Time",
      type: "datetime",
      required: true,
    },
    {
      id: "duration",
      name: "duration",
      label: "Duration (minutes)",
      type: "number",
      placeholder: "60",
      min: 15,
      required: true,
    },
    {
      id: "pricePerClient",
      name: "pricePerClient",
      label: "Price per client (cents)",
      type: "number",
      placeholder: "50.00",
      valueType: "number",
      min: 0,
      required: true,
    },
    {
      id: "currency",
      name: "currency",
      label: "Currency",
      type: "select",
      options: Object.values(EBillingCurrency).map((value) => ({ label: value, value })),
      required: false,
    },
    {
      id: "paymentMethodType",
      name: "paymentMethodType",
      label: "Payment Method",
      type: "select",
      required: false,
      options: Object.values(EPaymentMethodType).map((value) => ({ label: value, value })),
    },
    {
      id: "trainer",
      name: "trainer",
      label: "Trainer",
      type: "nested",
      required: true,
      subFields: [
        {
          id: "id",
          name: "id",
          label: "Select Trainer",
          type: "custom",
          required: true,
          valueType: "number",
          disabled: !!trainerId,
          Component: (props) => (
            <UserSelect props={props} level={EUserLevels[EUserRole.TRAINER]} />
          ),
        }
      ]
    },
    {
      id: "clients",
      name: "clients",
      label: "Clients",
      type: "multiSelect",
      options: users?.response?.data?.map((user) => ({ label: user.email, value: user.id })) || [],
      required: true,
 

    },
    {
      id: "description",
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Session description and notes...",
      required: false,
    },
    {
      id: "location",
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Gym Room 1 or https://zoom.us/...",
      required: false,
    },
    {
      id: "requirePrepayment",
      name: "requirePrepayment",
      label: "Require Prepayment",
      type: "switch",
      required: false,
    },
    {
      id: "cancellationDeadline",
      name: "cancellationDeadline",
      label: "Cancellation Deadline (hours)",
      type: "number",
      valueType: "number",
      placeholder: "24",
      min: 1,
      required: false,
    },
  ];

  const { inputs } = useInput<TSessionData>({
    fields,
    showRequiredAsterisk: true,
  });

  const onOpenChange = (state: boolean) => {
    if (state === false) onClose();
  };

  const formButtons = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={false}>
        {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update" : "Add"}
      </Button>
    </div>
  );

  return <>
    <ModalForm<TSessionData, ISession, ISessionFormModalExtraProps>
      title={`${isEditing ? "Edit" : "Add"} Session`}
      description={`${isEditing ? "Edit" : "Add a new"} session`}
      open={open}
      onOpenChange={onOpenChange}
      formStore={store}
      footerContent={formButtons}
      width="3xl"
    >
      <div className="space-y-8">
        {/* Session Info */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Session Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(0, 4) /* title → duration */}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(4, 7) /* pricePerClient → paymentMethodType */}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Trainer & Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(7, 9) /* trainer → clients */}
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h3 className="text-sm font-semibold mb-4">Additional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputs.slice(9) /* description → cancellationDeadline */}
          </div>
        </div>
      </div>

    </ModalForm>
  </>
}