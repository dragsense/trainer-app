import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { FileUpload } from "#/modules/v1/file-upload/entities/file-upload.entity";


export interface IFileUpload extends FileUpload, GeneralBaseEntity { };
