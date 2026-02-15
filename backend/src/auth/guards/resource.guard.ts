import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { TeamMemberRole } from '../../teams/entities/team-member.entity';

export const RESOURCE_KEY = 'resource';
export const RESOURCE_ACTION_KEY = 'resourceAction';

export enum ResourceType {
  PROJECT = 'project',
  TEAM = 'team',
  TASK = 'task',
  AUDIO = 'audio',
  ANNOTATION = 'annotation',
}

export enum ResourceAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export interface ResourceRequirement {
  type: ResourceType;
  param?: string; // Parameter name containing resource ID (default: 'id')
}

export interface ResourceActionRequirement {
  action: ResourceAction;
}

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceRequirement = this.reflector.getAllAndOverride<ResourceRequirement>(
      RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const actionRequirement = this.reflector.getAllAndOverride<ResourceActionRequirement>(
      RESOURCE_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no resource requirement, allow access
    if (!resourceRequirement) {
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

    const resourceType = resourceRequirement.type;
    const param = resourceRequirement.param || 'id';
    const resourceId = request.params[param];

    if (!resourceId) {
      throw new ForbiddenException('资源 ID 缺失');
    }

    const action = actionRequirement?.action || ResourceAction.READ;

    // Check permission based on resource type and action
    return this.checkPermission(user, resourceType, resourceId, action, request);
  }

  private async checkPermission(
    user: any,
    resourceType: ResourceType,
    resourceId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    switch (resourceType) {
      case ResourceType.PROJECT:
        return this.checkProjectPermission(user, resourceId, action, request);
      case ResourceType.TEAM:
        return this.checkTeamPermission(user, resourceId, action, request);
      case ResourceType.TASK:
        return this.checkTaskPermission(user, resourceId, action, request);
      case ResourceType.AUDIO:
        return this.checkAudioPermission(user, resourceId, action, request);
      case ResourceType.ANNOTATION:
        return this.checkAnnotationPermission(user, resourceId, action, request);
      default:
        throw new ForbiddenException('未知的资源类型');
    }
  }

  private async checkProjectPermission(
    user: any,
    projectId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    // Project admin can do everything
    if (user.role === UserRole.PROJECT_ADMIN) {
      return true;
    }

    // Get project team ID (would be injected by service in real implementation)
    const projectService = request.app.get('ProjectService');
    const project = await projectService.findOne(projectId);

    if (!project) {
      throw new ForbiddenException('项目不存在');
    }

    // Check if user is team member
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(project.teamId, user.id);

    if (!teamMember) {
      throw new ForbiddenException('您没有权限访问此项目');
    }

    // Team admin can do everything
    if (teamMember.role === TeamMemberRole.ADMIN) {
      return true;
    }

    // Reviewer can read and create, but cannot delete or manage
    if (user.role === UserRole.REVIEWER) {
      if (action === ResourceAction.DELETE || action === ResourceAction.MANAGE) {
        throw new ForbiddenException('审核员无法执行此操作');
      }
      return true;
    }

    // Annotator can only read and create their own resources
    if (user.role === UserRole.ANNOTATOR) {
      if (action === ResourceAction.DELETE || action === ResourceAction.MANAGE) {
        throw new ForbiddenException('标注员无法执行此操作');
      }
      return true;
    }

    return false;
  }

  private async checkTeamPermission(
    user: any,
    teamId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(teamId, user.id);

    if (!teamMember) {
      throw new ForbiddenException('您不是该团队成员');
    }

    // Team admin can do everything
    if (teamMember.role === TeamMemberRole.ADMIN) {
      return true;
    }

    // Members can only read
    if (action !== ResourceAction.READ) {
      throw new ForbiddenException('团队成员仅可查看');
    }

    return true;
  }

  private async checkTaskPermission(
    user: any,
    taskId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    // Get task to check assignee
    const taskService = request.app.get('TaskService');
    const task = await taskService.findOne(taskId);

    if (!task) {
      throw new ForbiddenException('任务不存在');
    }

    // Project admin can access all tasks
    if (user.role === UserRole.PROJECT_ADMIN) {
      return true;
    }

    // Check if user is team member
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(task.project.teamId, user.id);

    if (!teamMember) {
      throw new ForbiddenException('您没有权限访问此任务');
    }

    // Team admin can do everything
    if (teamMember.role === TeamMemberRole.ADMIN) {
      return true;
    }

    // Reviewer can read and update all tasks
    if (user.role === UserRole.REVIEWER) {
      if (action === ResourceAction.DELETE || action === ResourceAction.MANAGE) {
        throw new ForbiddenException('审核员无法执行此操作');
      }
      return true;
    }

    // Annotator can only read their own tasks
    if (user.role === UserRole.ANNOTATOR) {
      if (action === ResourceAction.READ && task.assigneeId !== user.id) {
        throw new ForbiddenException('您只能查看自己的任务');
      }
      if (action !== ResourceAction.READ && action !== ResourceAction.UPDATE) {
        throw new ForbiddenException('标注员无法执行此操作');
      }
      if (task.assigneeId !== user.id) {
        throw new ForbiddenException('您只能操作自己的任务');
      }
      return true;
    }

    return false;
  }

  private async checkAudioPermission(
    user: any,
    audioId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    // Get audio to check project
    const audioService = request.app.get('AudioService');
    const audio = await audioService.findOne(audioId);

    if (!audio) {
      throw new ForbiddenException('音频文件不存在');
    }

    // Project admin can access all audio
    if (user.role === UserRole.PROJECT_ADMIN) {
      return true;
    }

    // Check if user is team member
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(audio.project.teamId, user.id);

    if (!teamMember) {
      throw new ForbiddenException('您没有权限访问此音频');
    }

    // Team admin can do everything
    if (teamMember.role === TeamMemberRole.ADMIN) {
      return true;
    }

    // Reviewer and annotator can read and create
    if (action === ResourceAction.DELETE || action === ResourceAction.MANAGE) {
      throw new ForbiddenException('您没有权限执行此操作');
    }

    return true;
  }

  private async checkAnnotationPermission(
    user: any,
    annotationId: string,
    action: ResourceAction,
    request: any,
  ): Promise<boolean> {
    // Get annotation to check owner
    const annotationService = request.app.get('AnnotationService');
    const annotation = await annotationService.findOne(annotationId);

    if (!annotation) {
      throw new ForbiddenException('标注不存在');
    }

    // Project admin can access all annotations
    if (user.role === UserRole.PROJECT_ADMIN) {
      return true;
    }

    // Check if user is team member
    const teamMemberService = request.app.get('TeamMemberService');
    const teamMember = await teamMemberService.findByTeamAndUser(
      annotation.audio.project.teamId,
      user.id,
    );

    if (!teamMember) {
      throw new ForbiddenException('您没有权限访问此标注');
    }

    // Team admin can do everything
    if (teamMember.role === TeamMemberRole.ADMIN) {
      return true;
    }

    // Reviewer can read and update all annotations
    if (user.role === UserRole.REVIEWER) {
      if (action === ResourceAction.DELETE || action === ResourceAction.MANAGE) {
        throw new ForbiddenException('审核员无法执行此操作');
      }
      return true;
    }

    // Annotator can only read and update their own annotations
    if (user.role === UserRole.ANNOTATOR) {
      if (action === ResourceAction.READ && annotation.createdBy !== user.id) {
        throw new ForbiddenException('您只能查看自己的标注');
      }
      if (action !== ResourceAction.READ && action !== ResourceAction.UPDATE) {
        throw new ForbiddenException('标注员无法执行此操作');
      }
      if (annotation.createdBy !== user.id) {
        throw new ForbiddenException('您只能操作自己的标注');
      }
      return true;
    }

    return false;
  }
}