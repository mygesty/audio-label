import { httpService } from './http'
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  QueryProjectsRequest,
  ProjectsResponse,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
  BatchAddProjectMembersRequest,
  ProjectMember,
} from '../types/project'

export class ProjectService {
  /**
   * 创建项目
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await httpService.post<Project>('/projects', data)
    return response.data
  }

  /**
   * 获取项目列表
   */
  async getProjects(query: QueryProjectsRequest = {}): Promise<ProjectsResponse> {
    const params = new URLSearchParams()
    
    if (query.teamId) params.append('teamId', query.teamId)
    if (query.name) params.append('name', query.name)
    if (query.status) params.append('status', query.status)
    if (query.page) params.append('page', String(query.page))
    if (query.pageSize) params.append('pageSize', String(query.pageSize))

    const response = await httpService.get<ProjectsResponse>(`/projects?${params}`)
    return response.data
  }

  /**
   * 获取项目详情
   */
  async getProject(id: string): Promise<Project> {
    const response = await httpService.get<Project>(`/projects/${id}`)
    return response.data
  }

  /**
   * 更新项目
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await httpService.patch<Project>(`/projects/${id}`, data)
    return response.data
  }

  /**
   * 删除项目
   */
  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await httpService.delete<{ message: string }>(`/projects/${id}`)
    return response.data
  }

  /**
   * 获取项目成员列表
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await httpService.get<ProjectMember[]>(`/projects/${projectId}/members`)
    return response.data
  }

  /**
   * 添加项目成员
   */
  async addProjectMember(
    projectId: string,
    data: AddProjectMemberRequest,
  ): Promise<ProjectMember> {
    const response = await httpService.post<ProjectMember>(
      `/projects/${projectId}/members`,
      data,
    )
    return response.data
  }

  /**
   * 批量添加项目成员
   */
  async addProjectMembersBatch(
    projectId: string,
    data: BatchAddProjectMembersRequest,
  ): Promise<ProjectMember[]> {
    const response = await httpService.post<ProjectMember[]>(
      `/projects/${projectId}/members/batch`,
      data,
    )
    return response.data
  }

  /**
   * 移除项目成员
   */
  async removeProjectMember(
    projectId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const response = await httpService.delete<{ message: string }>(
      `/projects/${projectId}/members/${userId}`,
    )
    return response.data
  }

  /**
   * 更新项目成员角色
   */
  async updateProjectMemberRole(
    projectId: string,
    userId: string,
    data: UpdateProjectMemberRequest,
  ): Promise<ProjectMember> {
    const response = await httpService.patch<ProjectMember>(
      `/projects/${projectId}/members/${userId}`,
      data,
    )
    return response.data
  }
}

export const projectService = new ProjectService()