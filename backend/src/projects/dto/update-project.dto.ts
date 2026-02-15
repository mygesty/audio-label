import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @ApiProperty({ description: '项目名称', required: false })
  @IsString({ message: '项目名称必须是字符串' })
  @IsOptional()
  @MaxLength(255, { message: '项目名称不能超过255个字符' })
  name?: string;

  @ApiProperty({ description: '项目描述', required: false })
  @IsString({ message: '项目描述必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '项目设置', required: false })
  @IsOptional()
  settings?: Record<string, any>;

  @ApiProperty({ description: '项目状态', enum: ProjectStatus, required: false })
  @IsEnum(ProjectStatus, { message: '项目状态无效' })
  @IsOptional()
  status?: ProjectStatus;
}