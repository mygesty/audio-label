import http from './http';
import type {
  CheckPermissionRequest,
  CheckPermissionResponse,
  UserPermissions,
  RolePermissions,
  BatchCheckPermissionRequest,
  BatchCheckPermissionResponse,
} from '../types/permission';

/**
 * 权限服务
 */
export class PermissionService {
  /**
   * 检查用户对特定资源的权限
   */
  static async checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    const response = await http.post<CheckPermissionResponse>(
      '/auth/permissions/check',
      request,
    );
    return response.data;
  }

  /**
   * 批量检查用户权限
   */
  static async batchCheckPermission(
    request: BatchCheckPermissionRequest,
  ): Promise<BatchCheckPermissionResponse> {
    const response = await http.post<BatchCheckPermissionResponse>(
      '/auth/permissions/batch-check',
      request,
    );
    return response.data;
  }

  /**
   * 获取当前用户的权限信息
   */
  static async getUserPermissions(): Promise<UserPermissions> {
    const response = await http.get<UserPermissions>('/auth/permissions/user');
    return response.data;
  }

  /**
   * 获取所有角色的权限描述
   */
  static async getRolePermissions(): Promise<RolePermissions[]> {
    const response = await http.get<RolePermissions[]>('/auth/permissions/roles');
    return response.data;
  }

  /**
   * 本地权限检查（快速检查，不请求后端）
   */
  static hasPermissionByRole(
    userRole: string,
    resourceType: string,
    action: string,
  ): boolean {
    // System admin has all permissions
    if (userRole === 'system_admin') {
      return true;
    }

    // Project admin has all permissions
    if (userRole === 'project_admin') {
      return true;
    }

    // Reviewer permissions
    if (userRole === 'reviewer') {
      if (action === 'delete' || action === 'manage') {
        return false;
      }
      return true;
    }

    // Annotator permissions
    if (userRole === 'annotator') {
      if (action === 'delete' || action === 'manage') {
        return false;
      }
      if (action === 'read' || action === 'create' || action === 'update') {
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * 检查用户是否可以审核
   */
  static canReview(userRole: string): boolean {
    return userRole === 'reviewer' || userRole === 'project_admin' || userRole === 'system_admin';
  }

  /**
   * 检查用户是否可以分配任务
   */
  static canAssignTasks(userRole: string): boolean {
    return userRole === 'project_admin' || userRole === 'system_admin';
  }

  /**
   * 检查用户是否可以管理项目
   */
  static canManageProjects(userRole: string): boolean {
    return userRole === 'project_admin' || userRole === 'system_admin';
  }

  /**
   * 检查用户是否可以管理团队
   */
  static canManageTeam(userRole: string, teamRole?: string): boolean {
    return (
      userRole === 'system_admin' ||
      (userRole === 'project_admin' && teamRole === 'admin')
    );
  }

  /**
   * 检查用户是否可以管理用户
   */
  static canManageUsers(userRole: string): boolean {
    return userRole === 'system_admin';
  }

  /**
   * 检查用户是否可以管理系统设置
   */
  static canManageSystem(userRole: string): boolean {
    return userRole === 'system_admin';
  }
}

export default PermissionService;