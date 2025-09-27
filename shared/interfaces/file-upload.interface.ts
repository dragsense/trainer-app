import { FileUpload } from '../entities/file-uploads/file-upload.entity';
import { GeneralBaseEntity } from '../entities/common/base.entity';

export interface IFileUpload extends FileUpload, GeneralBaseEntity {}
