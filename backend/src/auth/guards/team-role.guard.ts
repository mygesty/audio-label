import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamMemberRole } from '../../teams/entities/team-member.entity';
import { UserRole } from '../../users/entities/user.entity';

export const TEAM_ROLES_KEY = 'teamRoles';

/**
 * 团队角色守卫：验证用户在特定团队中是否具有指定角色
 *
 * 使用方式：
 * @UseGuards(JwtAuthGuard, TeamRoleGuard)
 * @TeamRoles(TeamMemberRole.ADMIN, TeamMemberRole.MEMBER)
 */
@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTeamRoles = this.reflector.getAllAndOverride<TeamMemberRole[]>(
      TEAM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no team roles required, allow access
    if (!requiredTeamRoles || requiredTeamRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // System admin has all permissions
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }

    // Project admin also has elevated permissions
    if (user.role === UserRole.PROJECT_ADMIN) {
      return true;
    }

    // Get team ID from request params
    const teamId = request.params.teamId || request.body.teamId || request.query.teamId;

    if (!teamId) {
      throw new ForbiddenException('团队 ID 缺失');
    }

    // Get team member service from app context
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(teamId, user.id);

    if (!teamMember) {
      throw new ForbiddenException('您不是该团队成员');
    }

    // Check if user has required team role
    const hasRole = requiredTeamRoles.some((role) => teamMember.role === role);

    if (!hasRole) {
      throw new ForbiddenException('您在团队中的角色权限不足');
    }

    // Attach team member info to request for later use
    request.teamMember = teamMember;

    return true;
  }
}

/**
 * 装饰器：指定路由需要的团队角色
 * @param roles 团队角色列表
 */
export const TeamRoles = (...roles: TeamMemberRole[]) => {
  return SetMetadata(TEAM_ROLES_KEY, roles);
};