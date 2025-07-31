import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { FileListDto } from './dto/file-list.dto';


@ApiTags('File Upload')
@Controller('files')
export class FileUploadController {

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of File' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  findAll(@Query() queryDto: FileListDto) {
    return this.fileUploadService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File found' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'File ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fileUploadService.findOne(id);
  }
}
