/* eslint-disable prettier/prettier */
import { ListQueryDto } from "@/shared-dto/list-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class TrainerClientListDto extends ListQueryDto {

    @ApiPropertyOptional({
        description: 'Search by trainerId',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    trainerId?: number;

    @ApiPropertyOptional({
        description: 'Search by clientId',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    clientId?: number;

}