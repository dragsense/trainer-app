import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EFileType } from '../../enums/file-upload.enum';
import { ListQueryDto } from '../common/list-query.dto';
import { IFileUpload } from '../../interfaces/file-upload.interface';
import { PaginationMetaDto } from '../common/pagination.dto';

export class CreateFileUploadDto {
  @ApiProperty({ example: 'profile-picture.jpg' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mimetype: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  size: number;

  @ApiProperty({ example: '/uploads/profile/123.jpg' })
  @IsString()
  path: string;

  @ApiProperty({ enum: EFileType, example: EFileType.IMAGE })
  @IsEnum(EFileType)
  type: EFileType;

  @ApiProperty({ example: 1 })
  @IsOptional()
  userId?: number;
}

export class UpdateFileUploadDto extends PartialType(CreateFileUploadDto) {}

export class FileListDto extends ListQueryDto<IFileUpload> {
  @ApiPropertyOptional({ enum: EFileType })
  @IsOptional()
  @IsEnum(EFileType)
  type?: EFileType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}


