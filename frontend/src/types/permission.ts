/**
 * 用户角色枚举
 */
export const UserRole = {
  ANNOTATOR: 'annotator',
  REVIEWER: 'reviewer',
  PROJECT_ADMIN: 'project_admin',
  SYSTEM_ADMIN: 'system_admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * 团队角色枚举
 */
export const TeamMemberRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type TeamMemberRole = typeof TeamMemberRole[keyof typeof TeamMemberRole];

/**
 * 资源类型枚举
 */
export const ResourceType = {
  PROJECT: 'project',
  TEAM: 'team',
  TASK: 'task',
  AUDIO: 'audio',
  ANNOTATION: 'annotation',
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

/**
 * 资源操作枚举
 */
export const ResourceAction = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

export type ResourceAction = typeof ResourceAction[keyof typeof ResourceAction];

/**
 * 权限检查请求
 */
export interface CheckPermissionRequest {
  resourceType: ResourceType;
  resourceId: string;
  action: ResourceAction;
  teamId?: string;
}

/**
 * 权限检查响应
 */
export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
}

/**
 * 用户权限信息
 */
export interface UserPermissions {
  role: UserRole;
  teamRole?: TeamMemberRole;
  teamId?: string;
  allowedResources: string[];
  allowedActions: string[];
}

/**
 * 角色权限映射
 */
export interface RolePermissions {
  role: UserRole;
  description: string;
  features: string[];
}

/**
 * 批量权限检查请求
 */
export interface BatchCheckPermissionRequest {
  permissions: CheckPermissionRequest[];
}

/**
 * 批量权限检查响应
 */
export interface BatchCheckPermissionResponse {
  results: CheckPermissionResponse[];
}