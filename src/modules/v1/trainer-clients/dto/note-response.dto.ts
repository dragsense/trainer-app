/* eslint-disable prettier/prettier */
import { PaginationMetaDto } from "@/shared-dto/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { TrainerClient } from "../entities/trainer-client.entity";

export class TrainerClientsPaginatedDto extends PaginationMetaDto{
    @ApiProperty({ type: () => [TrainerClient] })
    @Type(() => TrainerClient)
    data: TrainerClient[]
}