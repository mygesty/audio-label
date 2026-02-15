import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TeamMemberRole } from '../entities/team-member.entity';

export class InviteMemberDto {
  @ApiProperty({
    description: '要邀请的成员邮箱列表',
    example: ['user1@example.com', 'user2@example.com'],
    type: [String],
  })
  @IsNotEmpty({ message: '邮箱列表不能为空' })
  @IsArray({ message: '邮箱必须是数组' })
  @IsEmail({}, { each: true, message: '邮箱格式不正确' })
  emails: string[];

  @ApiProperty({
    description: '成员角色',
    example: TeamMemberRole.MEMBER,
    enum: TeamMemberRole,
    default: TeamMemberRole.MEMBER,
  })
  @IsNotEmpty({ message: '成员角色不能为空' })
  @IsString({ message: '成员角色必须是字符串' })
  role: TeamMemberRole;
}