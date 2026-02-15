import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: '团队名称',
    example: '标注团队 A',
    maxLength: 255,
  })
  @IsNotEmpty({ message: '团队名称不能为空' })
  @IsString({ message: '团队名称必须是字符串' })
  @MaxLength(255, { message: '团队名称不能超过 255 个字符' })
  name: string;

  @ApiProperty({
    description: '团队描述',
    example: '负责音频数据标注工作',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '团队描述必须是字符串' })
  description?: string;
}