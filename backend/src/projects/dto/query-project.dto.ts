import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../entities/project.entity';

export class QueryProjectDto {
  @ApiProperty({ description: '团队ID', required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ description: '项目名称（模糊搜索）', required: false })
  @IsString({ message: '项目名称必须是字符串' })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '项目状态', enum: ProjectStatus, required: false })
  @IsEnum(ProjectStatus, { message: '项目状态无效' })
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}