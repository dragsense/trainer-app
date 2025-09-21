import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Types
import { ITrainerClient } from "@/@types/trainer-client.type";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { TrainerClientList } from "@/components/admin";
import { TrainerClientAssignForm } from "@/page-components";
import { TrainerClientViewModal } from "@/components/admin/trainer-clients/view";

// API
import { fetchTrainerClientById, fetchTrainerClients, removeTrainerClientAssignment } from "@/services/trainer-client.api";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { IMessageResponse } from "@/@types/api/response.type";

export default function TrainerClientsPage() {

    const [searchParams] = useSearchParams();

    const tId = searchParams.get("trainerId");
    const cId = searchParams.get("trainerClientId");

    const trainerId = tId ? Number(tId) : 0;
    const clientId = cId ? Number(cId) : 0;

    const queryTrainerClient = useQueryClient();

    const STORE_KEY = 'trainerClient';

    return (
        <PageInnerLayout Header={<Header />}>
            <SingleHandler<ITrainerClient>
                queryFn={fetchTrainerClientById}
                deleteFn={removeTrainerClientAssignment}
                storeKey={STORE_KEY}
                onDeleteSuccess={() => queryTrainerClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
                SingleComponent={({ storeKey, store }) => <TrainerClientViewModal storeKey={storeKey} store={store} />}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: TrainerClientAssignForm
                    },
                ]}
            />

            <ListHandler<ITrainerClient>
                queryFn={(params) => fetchTrainerClients(params, { trainerId, clientId })}
                ListComponent={TrainerClientList}
                storeKey={STORE_KEY}
            />
        </PageInnerLayout>
    );
}



const Header = () => null
