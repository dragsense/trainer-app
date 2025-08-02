import { TrainerClient } from "#/modules/v1/trainer-clients/entities/trainer-client.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { CreateTrainerClientDto } from "#/modules/v1/trainer-clients/dto/create-trainer-client.dto";

export interface ITrainerClient extends TrainerClient, GeneralBaseEntity {}

export type TTrainerClientData = CreateTrainerClientDto;