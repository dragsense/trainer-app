/* eslint-disable prettier/prettier */
import { PaginationMetaDto } from "@/shared-dto/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { FileUpload } from "../entities/file-upload.entity";

export class FilePaginationDto extends PaginationMetaDto{
    @ApiProperty({ type: () => [FileUpload] })
    @Type(() => FileUpload)
    data: FileUpload[]
}