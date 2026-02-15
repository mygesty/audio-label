import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  CheckPermissionDto,
  PermissionCheckResponseDto,
  UserPermissionsDto,
  RolePermissionsDto,
  BatchCheckPermissionDto,
  BatchPermissionCheckResponseDto,
} from './dto/permission.dto';
import { ResourceType, ResourceAction } from './guards/resource.guard';

@ApiTags('权限管理')
@Controller('auth/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionController {
  /**
   * 检查用户对特定资源的权限
   */
  @Post('check')
  @ApiOperation({ summary: '检查用户权限' })
  async checkPermission(
    @Request() req,
    @Body() checkPermissionDto: CheckPermissionDto,
  ): Promise<PermissionCheckResponseDto> {
    const user = req.user;
    const { resourceType, resourceId, action, teamId } = checkPermissionDto;

    try {
      const allowed = await this.hasPermission(user, resourceType, resourceId, action, teamId);
      return {
        allowed,
        reason: allowed ? undefined : '权限不足',
      };
    } catch (error) {
      return {
        allowed: false,
        reason: error.message || '权限检查失败',
      };
    }
  }

  /**
   * 批量检查用户权限
   */
  @Post('batch-check')
  @ApiOperation({ summary: '批量检查用户权限' })
  async batchCheckPermission(
    @Request() req,
    @Body() batchCheckDto: BatchCheckPermissionDto,
  ): Promise<BatchPermissionCheckResponseDto> {
    const results = await Promise.all(
      batchCheckDto.permissions.map((permission) =>
        this.checkPermission(req, permission),
      ),
    );

    return { results };
  }

  /**
   * 获取当前用户的权限信息
   */
  @Get('user')
  @ApiOperation({ summary: '获取当前用户权限信息' })
  async getUserPermissions(@Request() req): Promise<UserPermissionsDto> {
    const user = req.user;

    return {
      role: user.role,
      allowedResources: this.getAllowedResources(user.role),
      allowedActions: this.getAllowedActions(user.role),
    };
  }

  /**
   * 获取所有角色的权限描述
   */
  @Get('roles')
  @ApiOperation({ summary: '获取角色权限描述' })
  @Roles(UserRole.SYSTEM_ADMIN)
  async getRolePermissions(): Promise<RolePermissionsDto[]> {
    return [
      {
        role: UserRole.ANNOTATOR,
        description: '标注员：可以标注音频、查看自己的任务',
        features: [
          '标注音频',
          '查看自己的任务',
          '提交审核',
          '查看个人统计',
        ],
      },
      {
        role: UserRole.REVIEWER,
        description: '审核员：可以审核标注、查看所有任务',
        features: [
          '标注音频',
          '查看所有任务',
          '审核通过/驳回',
          '查看团队统计',
        ],
      },
      {
        role: UserRole.PROJECT_ADMIN,
        description: '项目管理员：可以管理项目、分配任务',
        features: [
          '标注音频',
          '查看所有任务',
          '审核通过/驳回',
          '创建项目',
          '分配任务',
          '管理项目成员',
          '查看团队统计',
        ],
      },
      {
        role: UserRole.SYSTEM_ADMIN,
        description: '系统管理员：拥有所有权限',
        features: [
          '标注音频',
          '查看所有任务',
          '审核通过/驳回',
          '创建项目',
          '分配任务',
          '管理项目成员',
          '查看团队统计',
          '管理系统设置',
          '管理所有用户',
        ],
      },
    ];
  }

  /**
   * 内部方法：检查权限（简化版，实际应该调用 ResourceGuard）
   */
  private async hasPermission(
    user: any,
    resourceType: ResourceType,
    resourceId: string,
    action: ResourceAction,
    teamId?: string,
  ): Promise<boolean> {
    // System admin has all permissions
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return true;
    }

    // Simplified permission check logic
    // In production, this should use the ResourceGuard logic
    switch (user.role) {
      case UserRole.PROJECT_ADMIN:
        return true;
      case UserRole.REVIEWER:
        return action !== ResourceAction.DELETE && action !== ResourceAction.MANAGE;
      case UserRole.ANNOTATOR:
        return (
          action === ResourceAction.READ ||
          action === ResourceAction.CREATE ||
          action === ResourceAction.UPDATE
        );
      default:
        return false;
    }
  }

  /**
   * 获取角色允许的资源类型
   */
  private getAllowedResources(role: UserRole): string[] {
    switch (role) {
      case UserRole.SYSTEM_ADMIN:
      case UserRole.PROJECT_ADMIN:
        return ['project', 'team', 'task', 'audio', 'annotation'];
      case UserRole.REVIEWER:
        return ['task', 'audio', 'annotation'];
      case UserRole.ANNOTATOR:
        return ['audio', 'annotation'];
      default:
        return [];
    }
  }

  /**
   * 获取角色允许的操作
   */
  private getAllowedActions(role: UserRole): string[] {
    switch (role) {
      case UserRole.SYSTEM_ADMIN:
      case UserRole.PROJECT_ADMIN:
        return ['read', 'create', 'update', 'delete', 'manage'];
      case UserRole.REVIEWER:
        return ['read', 'create', 'update'];
      case UserRole.ANNOTATOR:
        return ['read', 'create', 'update'];
      default:
        return [];
    }
  }
}