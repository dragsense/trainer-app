// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { AvailabilityForm } from "@/page-components";


// API
import { fetchMyAvailability } from "@/services/user.api";

// Types
import { IUserAvailability } from "@/@types/user.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



export default function AvailabilityPage() {


    const STORE_KEY = 'availability';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<IUserAvailability>
                queryFn={fetchMyAvailability}
                storeKey={STORE_KEY}
                SingleComponent={AvailabilityForm}
                enabled={true}
            />
        </PageInnerLayout>
    );
}



const Header = () => null;
