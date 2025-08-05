import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

// Types
import { ITrainerClient } from "@/@types/trainer-client.type";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { TrainerClientTable } from "@/components/admin";
import { TrainerClientAssignForm } from "@/page-components";

// API
import { fetchTrainerClientById, fetchTrainerClients, removeTrainerClientAssignment } from "@/services/trainer-client.api";

// Layouts
import { PageInnerLayout } from "@/layouts";

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
                SingleComponent={() => null}
                actionComponents={[
                    {
                        action: 'createOrUpdate',
                        comp: TrainerClientAssignForm
                    },
                ]}
            />

            <ListHandler<ITrainerClient>
                queryFn={(params) => fetchTrainerClients(params, { trainerId, clientId })}
                ListComponent={TrainerClientTable}
                storeKey={STORE_KEY}
            />
        </PageInnerLayout>
    );
}



const Header = () => null
