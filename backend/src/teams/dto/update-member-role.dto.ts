import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { TeamMemberRole } from '../entities/team-member.entity';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: '成员角色',
    example: TeamMemberRole.ADMIN,
    enum: TeamMemberRole,
  })
  @IsNotEmpty({ message: '成员角色不能为空' })
  @IsEnum(TeamMemberRole, { message: '成员角色必须是有效的枚举值' })
  role: TeamMemberRole;
}