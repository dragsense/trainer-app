/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateFileUploadDto {

    @ApiProperty({ example: 'file.pdf', })
    fileName: string;
    
    @ApiProperty({
        type: 'string',
        format: 'binary',
        isArray: true,
        required: false,
        description: 'Upload one or more files (PDF, JPEG, PNG, etc.)',
    })
    @IsOptional()
    files?: Express.Multer.File[];
}
