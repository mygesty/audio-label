export const ProjectStatus = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const ProjectMemberRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type ProjectMemberRole = typeof ProjectMemberRole[keyof typeof ProjectMemberRole];

export interface Project {
  id: string
  teamId: string
  name: string
  description: string | null
  settings: Record<string, any>
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  team?: {
    id: string
    name: string
  }
  creator?: {
    id: string
    username: string
  }
}

export interface ProjectMember {
  userId: string
  role: ProjectMemberRole
  user?: {
    id: string
    username: string
    email: string
  }
}

export interface CreateProjectRequest {
  teamId: string
  name: string
  description?: string
  settings?: Record<string, any>
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  settings?: Record<string, any>
  status?: ProjectStatus
}

export interface QueryProjectsRequest {
  teamId?: string
  name?: string
  status?: ProjectStatus
  page?: number
  pageSize?: number
}

export interface ProjectsResponse {
  data: Project[]
  total: number
  page: number
  pageSize: number
}

export interface AddProjectMemberRequest {
  userId: string
  role: ProjectMemberRole
}

export interface UpdateProjectMemberRequest {
  role: ProjectMemberRole
}

export interface BatchAddProjectMembersRequest {
  members: AddProjectMemberRequest[]
}