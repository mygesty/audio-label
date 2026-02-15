import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioFolderDto } from './create-audio-folder.dto';

export class UpdateAudioFolderDto extends PartialType(CreateAudioFolderDto) {
  // 可以在这里添加额外的验证规则
}