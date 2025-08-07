// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { AppSettingsForm } from "@/page-components";


// API
import { fetchAppSettings } from "@/services/setting.api";

// Types
import { IAppSetting } from "@/@types/setting.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



export default function AppSettingsPage() {


    const STORE_KEY = 'app-settings';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IAppSetting>
                queryFn={fetchAppSettings}
                storeKey={STORE_KEY}
                SingleComponent={AppSettingsForm}
                enabled={true}
            />
        </PageInnerLayout>
    );
}



const Header = () => null;
