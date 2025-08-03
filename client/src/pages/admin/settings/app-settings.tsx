// External Libraries
import { z } from "zod";

// Types
import { IAppSetting, TAppSettingData } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { AppSettingCardForm } from "@/components/admin/settings";

// API
import { fetchAppSettings, updateAppSettings } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Schema
export const AppSettingSchema = z.object({
  allowNotification: z.boolean().optional(),
});

export default function AppSettingsPage() {
  const APP_SETTING_INITIAL_VALUES: TDefaultValue<Partial<TAppSettingData>> = {
    allowNotification: { value: true },
  };

  return ( <SingleHandler<IAppSetting, TAppSettingData,  IMessageResponse>
        queryFn={fetchAppSettings}
        storeKey="appSettings"
        mutationFns={{
          updateFn: () => updateAppSettings
        }}
        id={1}
        FormComponent={AppSettingCardForm}
        validationSchema={AppSettingSchema}
        initialValues={APP_SETTING_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />
  );
}
