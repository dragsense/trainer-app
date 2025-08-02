// External Libraries
import { z } from "zod";
import { useSearchParams } from "react-router-dom";


// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { TrainerClientTable, TrainerClientFormModal } from "@/components/admin";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { ITrainerClient, TTrainerClientData } from "@/@types/trainer.type";

// Layouts
import { PageInnerLayout } from "@/layouts";

// Services
import { assignTrainerToClient, fetchTrainerClientById, fetchTrainerClients, updateTrainerClient, removeTrainerClientAssignment } from "@/services/trainer-client.api";



// Schema
export const TrainerClientSchema = z.object({
    trainerId: z.number().min(1, "Trainer is required"),
    clientId: z.number().min(1, "Client is required"),
});



interface ITrainerClientFormExtraProps {
    trainerId?: number;
    clientId?: number;
}

export default function TrainerClientPage() {

    const [searchParams] = useSearchParams();

    const tId = searchParams.get("trainerId");
    const cId = searchParams.get("clientId");

    const trainerId = tId ? Number(tId) : 0;
    const clientId = cId ? Number(cId) : 0;

    const INITIAL_VALUES: TDefaultValue<TTrainerClientData> = {
        trainerId: { value: trainerId ? Number(trainerId) : 0 },
        clientId: { value: clientId ? Number(clientId) : 0 },
    };

    return (
        <PageInnerLayout Header={<Header />}>
            <ListHandler<ITrainerClient, Partial<TTrainerClientData>, IMessageResponse, any, ITrainerClientFormExtraProps>
                queryListFn={(params) => fetchTrainerClients(params, { trainerId, clientId })}
                ListComponent={TrainerClientTable}
                storeKey={`trainerclient`}
                mutationFns={{
                    createFn: assignTrainerToClient,
                    updateFn: updateTrainerClient,
                    deleteFn: removeTrainerClientAssignment
                }}
                queryFn={fetchTrainerClientById}
                FormComponent={TrainerClientFormModal}
                validationSchema={TrainerClientSchema}
                initialValues={INITIAL_VALUES}
                validationMode={EVALIDATION_MODES.OnChange}
                formProps={{
                    trainerId,
                    clientId,
                }}
            />

        </PageInnerLayout>
    );
}



const Header = () => null
