import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUUID, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ description: '团队ID' })
  @IsUUID()
  @IsNotEmpty({ message: '团队ID不能为空' })
  teamId: string;

  @ApiProperty({ description: '项目名称', maxLength: 255 })
  @IsString({ message: '项目名称必须是字符串' })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(255, { message: '项目名称不能超过255个字符' })
  name: string;

  @ApiProperty({ description: '项目描述', required: false })
  @IsString({ message: '项目描述必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '项目状态', enum: [ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED], default: ProjectStatus.ACTIVE })
  @IsEnum([ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED], { message: '项目状态必须是 active 或 archived' })
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ description: '项目设置', required: false, default: {} })
  @IsOptional()
  settings?: Record<string, any>;
}