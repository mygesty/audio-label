import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsArray } from 'class-validator';

export enum ProjectMemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

export class AddProjectMemberDto {
  @ApiProperty({ description: '用户ID' })
  @IsUUID()
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;

  @ApiProperty({ description: '成员角色', enum: ProjectMemberRole, default: ProjectMemberRole.MEMBER })
  @IsEnum(ProjectMemberRole, { message: '成员角色无效' })
  @IsNotEmpty({ message: '成员角色不能为空' })
  role: ProjectMemberRole;
}

export class UpdateProjectMemberDto {
  @ApiProperty({ description: '成员角色', enum: ProjectMemberRole })
  @IsEnum(ProjectMemberRole, { message: '成员角色无效' })
  @IsNotEmpty({ message: '成员角色不能为空' })
  role: ProjectMemberRole;
}

export class BatchAddProjectMembersDto {
  @ApiProperty({ description: '成员列表', type: [AddProjectMemberDto] })
  @IsArray({ message: '成员列表必须是数组' })
  @IsNotEmpty({ message: '成员列表不能为空' })
  members: AddProjectMemberDto[];
}