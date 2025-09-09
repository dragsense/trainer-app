// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { NotificationSettingsForm } from "@/page-components";


// API
import { fetchNotificationSettings } from "@/services/setting.api";

// Types
import { INotificationSetting } from "@/@types/setting.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



export default function NotificationSettingsPage() {


    const STORE_KEY = 'notification-settings';

    return (
            <SingleHandler<INotificationSetting>
                queryFn={fetchNotificationSettings}
                storeKey={STORE_KEY}
                SingleComponent={NotificationSettingsForm}
                enabled={true}
            />
    );
}



const Header = () => null;
