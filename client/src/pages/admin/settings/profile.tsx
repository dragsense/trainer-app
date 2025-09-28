// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { ProfileForm } from "@/page-components";


// API
import { fetchProfile } from "@/services/user.api";

// Types
import { IProfile } from "@shared/interfaces/user.interface";

// Layouts
import { PageInnerLayout } from "@/layouts";



export default function ProfilePage() {


    const STORE_KEY = 'profile';

    return (
        <SingleHandler<IProfile>
            queryFn={fetchProfile}
            storeKey={STORE_KEY}
            SingleComponent={ProfileForm}
            enabled={true}
        />

    );
}



const Header = () => null;
