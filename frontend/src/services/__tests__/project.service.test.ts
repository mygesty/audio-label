import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from '../http';
import { projectService } from '../project.service';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  QueryProjectsRequest,
  ProjectsResponse,
  AddProjectMemberRequest,
  UpdateProjectMemberRequest,
  BatchAddProjectMembersRequest,
} from '../../types/project';
import { ProjectStatus, ProjectMemberRole } from '../../types/project';

// Mock http module
vi.mock('../http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建项目', async () => {
      const request: CreateProjectRequest = {
        teamId: 'team-123',
        name: 'Test Project',
        description: 'Test description',
        settings: {},
      };

      const mockResponse: Project = {
        id: 'project-123',
        teamId: request.teamId,
        name: request.name,
        description: request.description,
        settings: request.settings,
        status: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await projectService.create(request);

      expect(http.post).toHaveBeenCalledWith('/projects', request);
      expect(result).toEqual(mockResponse);
    });

    it('应该处理创建项目时的错误', async () => {
      const request: CreateProjectRequest = {
        teamId: 'team-123',
        name: 'Test Project',
      };

      const errorMessage = '创建项目失败';
      vi.mocked(http.post).mockRejectedValue(new Error(errorMessage));

      await expect(projectService.create(request)).rejects.toThrow(errorMessage);
    });
  });

  describe('getProjects', () => {
    it('应该成功获取项目列表', async () => {
      const mockResponse: ProjectsResponse = {
        data: [
          {
            id: 'project-1',
            teamId: 'team-1',
            name: 'Project 1',
            description: 'Description 1',
            settings: {},
            status: ProjectStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            team: { id: 'team-1', name: 'Team 1' },
            creator: { id: 'user-1', username: 'user1' },
          },
          {
            id: 'project-2',
            teamId: 'team-1',
            name: 'Project 2',
            description: 'Description 2',
            settings: {},
            status: ProjectStatus.ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await projectService.getProjects({ page: 1, pageSize: 10 });

      expect(http.get).toHaveBeenCalledWith('/projects?page=1&pageSize=10');
      expect(result).toEqual(mockResponse);
    });

    it('应该正确处理查询参数', async () => {
      const query: QueryProjectsRequest = {
        teamId: 'team-123',
        name: 'Test',
        status: ProjectStatus.ACTIVE,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(http.get).mockResolvedValue({
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      });

      await projectService.getProjects(query);

      expect(http.get).toHaveBeenCalledWith(
        expect.stringMatching(/teamId=team-123&name=Test&status=active&page=1&pageSize=20/),
      );
    });

    it('应该处理空查询参数', async () => {
      vi.mocked(http.get).mockResolvedValue({
        data: { data: [], total: 0, page: 1, pageSize: 10 },
      });

      await projectService.getProjects({});

      expect(http.get).toHaveBeenCalledWith('/projects?page=1&pageSize=10');
    });
  });

  describe('getProject', () => {
    it('应该成功获取项目详情', async () => {
      const projectId = 'project-123';
      const mockResponse: Project = {
        id: projectId,
        teamId: 'team-123',
        name: 'Test Project',
        description: 'Test description',
        settings: {},
        status: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        team: { id: 'team-123', name: 'Test Team' },
        creator: { id: 'user-123', username: 'testuser' },
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await projectService.getProject(projectId);

      expect(http.get).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockResponse);
    });

    it('应该处理获取不存在项目的情况', async () => {
      const projectId = 'non-existent';
      const errorMessage = '项目不存在';

      vi.mocked(http.get).mockRejectedValue(new Error(errorMessage));

      await expect(projectService.getProject(projectId)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateProject', () => {
    it('应该成功更新项目', async () => {
      const projectId = 'project-123';
      const updateData: UpdateProjectRequest = {
        name: 'Updated Project',
        description: 'Updated description',
        status: ProjectStatus.ARCHIVED,
      };

      const mockResponse: Project = {
        id: projectId,
        teamId: 'team-123',
        name: updateData.name,
        description: updateData.description,
        settings: {},
        status: updateData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(http.patch).mockResolvedValue({ data: mockResponse });

      const result = await projectService.updateProject(projectId, updateData);

      expect(http.patch).toHaveBeenCalledWith(`/projects/${projectId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('应该支持部分更新', async () => {
      const projectId = 'project-123';
      const updateData: UpdateProjectRequest = {
        name: 'Updated Name',
      };

      const mockResponse: Project = {
        id: projectId,
        teamId: 'team-123',
        name: updateData.name,
        description: 'Original description',
        settings: {},
        status: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(http.patch).mockResolvedValue({ data: mockResponse });

      const result = await projectService.updateProject(projectId, updateData);

      expect(result.name).toBe(updateData.name);
    });
  });

  describe('deleteProject', () => {
    it('应该成功删除项目', async () => {
      const projectId = 'project-123';
      const mockResponse = { message: '项目删除成功' };

      vi.mocked(http.delete).mockResolvedValue({ data: mockResponse });

      const result = await projectService.deleteProject(projectId);

      expect(http.delete).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProjectMembers', () => {
    it('应该成功获取项目成员列表', async () => {
      const projectId = 'project-123';
      const mockResponse = [
        {
          userId: 'user-1',
          role: ProjectMemberRole.ADMIN,
          user: { id: 'user-1', username: 'admin', email: 'admin@example.com' },
        },
        {
          userId: 'user-2',
          role: ProjectMemberRole.MEMBER,
          user: { id: 'user-2', username: 'member', email: 'member@example.com' },
        },
      ];

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await projectService.getProjectMembers(projectId);

      expect(http.get).toHaveBeenCalledWith(`/projects/${projectId}/members`);
      expect(result).toEqual(mockResponse);
    });

    it('应该返回空数组当项目没有成员时', async () => {
      const projectId = 'project-123';
      vi.mocked(http.get).mockResolvedValue({ data: [] });

      const result = await projectService.getProjectMembers(projectId);

      expect(result).toEqual([]);
    });
  });

  describe('addProjectMember', () => {
    it('应该成功添加项目成员', async () => {
      const projectId = 'project-123';
      const memberData: AddProjectMemberRequest = {
        userId: 'user-123',
        role: ProjectMemberRole.MEMBER,
      };

      const mockResponse = {
        userId: memberData.userId,
        role: memberData.role,
        user: { id: memberData.userId, username: 'testuser', email: 'test@example.com' },
      };

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await projectService.addProjectMember(projectId, memberData);

      expect(http.post).toHaveBeenCalledWith(`/projects/${projectId}/members`, memberData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addProjectMembersBatch', () => {
    it('应该成功批量添加项目成员', async () => {
      const projectId = 'project-123';
      const batchData: BatchAddProjectMembersRequest = {
        members: [
          { userId: 'user-1', role: ProjectMemberRole.ADMIN },
          { userId: 'user-2', role: ProjectMemberRole.MEMBER },
        ],
      };

      const mockResponse = [
        {
          userId: 'user-1',
          role: ProjectMemberRole.ADMIN,
          user: { id: 'user-1', username: 'user1', email: 'user1@example.com' },
        },
        {
          userId: 'user-2',
          role: ProjectMemberRole.MEMBER,
          user: { id: 'user-2', username: 'user2', email: 'user2@example.com' },
        },
      ];

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await projectService.addProjectMembersBatch(projectId, batchData);

      expect(http.post).toHaveBeenCalledWith(`/projects/${projectId}/members/batch`, batchData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeProjectMember', () => {
    it('应该成功移除项目成员', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const mockResponse = { message: '成员移除成功' };

      vi.mocked(http.delete).mockResolvedValue({ data: mockResponse });

      const result = await projectService.removeProjectMember(projectId, userId);

      expect(http.delete).toHaveBeenCalledWith(`/projects/${projectId}/members/${userId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProjectMemberRole', () => {
    it('应该成功更新项目成员角色', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateData: UpdateProjectMemberRequest = {
        role: ProjectMemberRole.ADMIN,
      };

      const mockResponse = {
        userId: userId,
        role: updateData.role,
        user: { id: userId, username: 'testuser', email: 'test@example.com' },
      };

      vi.mocked(http.patch).mockResolvedValue({ data: mockResponse });

      const result = await projectService.updateProjectMemberRole(projectId, userId, updateData);

      expect(http.patch).toHaveBeenCalledWith(
        `/projects/${projectId}/members/${userId}`,
        updateData,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('数据格式验证', () => {
    it('应该正确处理项目状态枚举', async () => {
      const mockResponse: Project = {
        id: 'project-123',
        teamId: 'team-123',
        name: 'Test Project',
        description: 'Test description',
        settings: {},
        status: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await projectService.getProject('project-123');

      expect(result.status).toBe(ProjectStatus.ACTIVE);
      expect(['active', 'archived', 'deleted']).toContain(result.status);
    });

    it('应该正确处理成员角色枚举', async () => {
      const mockResponse = [
        {
          userId: 'user-123',
          role: ProjectMemberRole.ADMIN,
          user: { id: 'user-123', username: 'admin', email: 'admin@example.com' },
        },
      ];

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await projectService.getProjectMembers('project-123');

      expect(result[0].role).toBe(ProjectMemberRole.ADMIN);
      expect(['member', 'admin']).toContain(result[0].role);
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      vi.mocked(http.get).mockRejectedValue(new Error('Network Error'));

      await expect(projectService.getProjects({})).rejects.toThrow('Network Error');
    });

    it('应该处理 API 错误响应', async () => {
      const error = new Error('API Error');
      (error as any).response = {
        status: 400,
        data: { message: 'Invalid request' },
      };

      vi.mocked(http.post).mockRejectedValue(error);

      await expect(
        projectService.create({
          teamId: 'team-123',
          name: 'Test Project',
        }),
      ).rejects.toThrow('API Error');
    });
  });
});