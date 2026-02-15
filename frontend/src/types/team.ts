/**
 * 团队成员角色枚举
 */
export const TeamMemberRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type TeamMemberRole = typeof TeamMemberRole[keyof typeof TeamMemberRole];

/**
 * 团队成员接口
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
}

/**
 * 团队接口
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    username: string;
  };
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  teamMembers?: TeamMember[];
}

/**
 * 创建团队请求接口
 */
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

/**
 * 更新团队请求接口
 */
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

/**
 * 邀请成员请求接口
 */
export interface InviteMemberRequest {
  emails: string[];
  role: TeamMemberRole;
}

/**
 * 更新成员角色请求接口
 */
export interface UpdateMemberRoleRequest {
  role: TeamMemberRole;
}

/**
 * 查询团队请求接口
 */
export interface QueryTeamRequest {
  search?: string;
}

/**
 * 团队成员角色标签
 */
export const TeamMemberRoleLabels: Record<TeamMemberRole, string> = {
  [TeamMemberRole.MEMBER]: '成员',
  [TeamMemberRole.ADMIN]: '管理员',
};

/**
 * 团队成员角色颜色
 */
export const TeamMemberRoleColors: Record<TeamMemberRole, string> = {
  [TeamMemberRole.MEMBER]: 'success',
  [TeamMemberRole.ADMIN]: 'warning',
} as const;