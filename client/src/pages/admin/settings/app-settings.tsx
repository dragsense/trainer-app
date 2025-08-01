// External Libraries
import { z } from "zod";

// Types
import { IAppSetting } from "@/@types/setting.type";
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
  const APP_SETTING_INITIAL_VALUES: TDefaultValue<Partial<IAppSetting>> = {
    allowNotification: { value: true },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure application preferences
        </p>
      </div>
      
      <SingleHandler<IAppSetting, Partial<IAppSetting>, IAppSetting | IMessageResponse>
        queryFn={fetchAppSettings}
        storeKey="appSettings"
        mutationFns={{
          updateFn: () => updateAppSettings
        }}
        FormComponent={AppSettingCardForm}
        validationSchema={AppSettingSchema}
        initialValues={APP_SETTING_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />
    </div>
  );
}
