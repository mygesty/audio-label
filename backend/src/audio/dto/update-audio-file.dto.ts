import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioFileDto } from './create-audio-file.dto';

export class UpdateAudioFileDto extends PartialType(CreateAudioFileDto) {
  // 可以在这里添加额外的验证规则
}