import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { TeamMemberRole } from '../../teams/entities/team-member.entity';
import { ResourceType, ResourceAction } from '../guards/resource.guard';

/**
 * 权限检查请求 DTO
 */
export class CheckPermissionDto {
  @ApiProperty({ description: '资源类型', enum: ResourceType })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({ description: '资源 ID' })
  @IsString()
  resourceId: string;

  @ApiProperty({ description: '操作类型', enum: ResourceAction })
  @IsEnum(ResourceAction)
  action: ResourceAction;

  @ApiProperty({ description: '团队 ID（可选）', required: false })
  @IsOptional()
  @IsString()
  teamId?: string;
}

/**
 * 权限检查响应 DTO
 */
export class PermissionCheckResponseDto {
  @ApiProperty({ description: '是否有权限' })
  allowed: boolean;

  @ApiProperty({ description: '拒绝原因（如果无权限）', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * 用户权限信息 DTO
 */
export class UserPermissionsDto {
  @ApiProperty({ description: '用户角色', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: '团队角色', enum: TeamMemberRole, required: false })
  @IsOptional()
  teamRole?: TeamMemberRole;

  @ApiProperty({ description: '团队 ID', required: false })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ description: '允许的资源类型' })
  @IsArray()
  @IsString({ each: true })
  allowedResources: string[];

  @ApiProperty({ description: '允许的操作' })
  @IsArray()
  @IsString({ each: true })
  allowedActions: string[];
}

/**
 * 角色权限映射 DTO
 */
export class RolePermissionsDto {
  @ApiProperty({ description: '角色', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: '权限描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '允许的功能' })
  @IsArray()
  @IsString({ each: true })
  features: string[];
}

/**
 * 批量权限检查请求 DTO
 */
export class BatchCheckPermissionDto {
  @ApiProperty({ description: '权限检查列表', type: [CheckPermissionDto] })
  @IsArray()
  permissions: CheckPermissionDto[];
}

/**
 * 批量权限检查响应 DTO
 */
export class BatchPermissionCheckResponseDto {
  @ApiProperty({ description: '权限检查结果', type: [PermissionCheckResponseDto] })
  results: PermissionCheckResponseDto[];
}