// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { ProfileForm } from "@/page-components";


// API
import { fetchProfile } from "@/services/user.api";

// Types
import { IProfile } from "@/@types/user.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



export default function ProfilePage() {


    const STORE_KEY = 'profile';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IProfile>
                queryFn={fetchProfile}
                storeKey={STORE_KEY}
                SingleComponent={ProfileForm}
                enabled={true}
            />
        </PageInnerLayout>
    );
}



const Header = () => null;
