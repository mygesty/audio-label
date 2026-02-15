import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from '../http';
import PermissionService from '../permission.service';
import type {
  CheckPermissionRequest,
  CheckPermissionResponse,
  UserPermissions,
  RolePermissions,
  BatchCheckPermissionRequest,
  BatchCheckPermissionResponse,
} from '../../types/permission';
import { UserRole, ResourceType, ResourceAction } from '../../types/permission';

// Mock http module
vi.mock('../http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('PermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('应该正确调用权限检查 API', async () => {
      const request: CheckPermissionRequest = {
        resourceType: ResourceType.PROJECT,
        resourceId: 'project-123',
        action: ResourceAction.READ,
      };

      const mockResponse: CheckPermissionResponse = {
        allowed: true,
      };

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await PermissionService.checkPermission(request);

      expect(http.post).toHaveBeenCalledWith('/auth/permissions/check', request);
      expect(result).toEqual(mockResponse);
    });

    it('应该处理权限拒绝的情况', async () => {
      const request: CheckPermissionRequest = {
        resourceType: ResourceType.PROJECT,
        resourceId: 'project-123',
        action: ResourceAction.DELETE,
      };

      const mockResponse: CheckPermissionResponse = {
        allowed: false,
        reason: '权限不足',
      };

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await PermissionService.checkPermission(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('权限不足');
    });
  });

  describe('batchCheckPermission', () => {
    it('应该支持批量权限检查', async () => {
      const request: BatchCheckPermissionRequest = {
        permissions: [
          {
            resourceType: ResourceType.PROJECT,
            resourceId: 'project-123',
            action: ResourceAction.READ,
          },
          {
            resourceType: ResourceType.PROJECT,
            resourceId: 'project-123',
            action: ResourceAction.DELETE,
          },
        ],
      };

      const mockResponse: BatchPermissionCheckResponse = {
        results: [
          { allowed: true },
          { allowed: false, reason: '权限不足' },
        ],
      };

      vi.mocked(http.post).mockResolvedValue({ data: mockResponse });

      const result = await PermissionService.batchCheckPermission(request);

      expect(http.post).toHaveBeenCalledWith('/auth/permissions/batch-check', request);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].allowed).toBe(true);
      expect(result.results[1].allowed).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('应该返回当前用户的权限信息', async () => {
      const mockResponse: UserPermissions = {
        role: UserRole.ANNOTATOR,
        allowedResources: ['audio', 'annotation'],
        allowedActions: ['read', 'create', 'update'],
      };

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await PermissionService.getUserPermissions();

      expect(http.get).toHaveBeenCalledWith('/auth/permissions/user');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRolePermissions', () => {
    it('应该返回所有角色的权限描述', async () => {
      const mockResponse: RolePermissions[] = [
        {
          role: UserRole.ANNOTATOR,
          description: '标注员：可以标注音频、查看自己的任务',
          features: ['标注音频', '查看自己的任务'],
        },
      ];

      vi.mocked(http.get).mockResolvedValue({ data: mockResponse });

      const result = await PermissionService.getRolePermissions();

      expect(http.get).toHaveBeenCalledWith('/auth/permissions/roles');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('hasPermissionByRole', () => {
    it('系统管理员应该拥有所有权限', () => {
      expect(
        PermissionService.hasPermissionByRole(UserRole.SYSTEM_ADMIN, 'project', 'delete'),
      ).toBe(true);
    });

    it('项目管理员应该拥有所有权限', () => {
      expect(
        PermissionService.hasPermissionByRole(UserRole.PROJECT_ADMIN, 'project', 'delete'),
      ).toBe(true);
    });

    it('审核员不能删除资源', () => {
      expect(
        PermissionService.hasPermissionByRole(UserRole.REVIEWER, 'project', 'delete'),
      ).toBe(false);
      expect(
        PermissionService.hasPermissionByRole(UserRole.REVIEWER, 'project', 'manage'),
      ).toBe(false);
    });

    it('审核员可以读取、创建和更新', () => {
      expect(PermissionService.hasPermissionByRole(UserRole.REVIEWER, 'project', 'read')).toBe(
        true,
      );
      expect(
        PermissionService.hasPermissionByRole(UserRole.REVIEWER, 'project', 'create'),
      ).toBe(true);
      expect(
        PermissionService.hasPermissionByRole(UserRole.REVIEWER, 'project', 'update'),
      ).toBe(true);
    });

    it('标注员不能删除资源', () => {
      expect(
        PermissionService.hasPermissionByRole(UserRole.ANNOTATOR, 'audio', 'delete'),
      ).toBe(false);
      expect(
        PermissionService.hasPermissionByRole(UserRole.ANNOTATOR, 'audio', 'manage'),
      ).toBe(false);
    });

    it('标注员可以读取、创建和更新', () => {
      expect(PermissionService.hasPermissionByRole(UserRole.ANNOTATOR, 'audio', 'read')).toBe(
        true,
      );
      expect(PermissionService.hasPermissionByRole(UserRole.ANNOTATOR, 'audio', 'create')).toBe(
        true,
      );
      expect(PermissionService.hasPermissionByRole(UserRole.ANNOTATOR, 'audio', 'update')).toBe(
        true,
      );
    });
  });

  describe('canReview', () => {
    it('审核员可以审核', () => {
      expect(PermissionService.canReview(UserRole.REVIEWER)).toBe(true);
    });

    it('项目管理员可以审核', () => {
      expect(PermissionService.canReview(UserRole.PROJECT_ADMIN)).toBe(true);
    });

    it('系统管理员可以审核', () => {
      expect(PermissionService.canReview(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('标注员不能审核', () => {
      expect(PermissionService.canReview(UserRole.ANNOTATOR)).toBe(false);
    });
  });

  describe('canAssignTasks', () => {
    it('项目管理员可以分配任务', () => {
      expect(PermissionService.canAssignTasks(UserRole.PROJECT_ADMIN)).toBe(true);
    });

    it('系统管理员可以分配任务', () => {
      expect(PermissionService.canAssignTasks(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('审核员不能分配任务', () => {
      expect(PermissionService.canAssignTasks(UserRole.REVIEWER)).toBe(false);
    });

    it('标注员不能分配任务', () => {
      expect(PermissionService.canAssignTasks(UserRole.ANNOTATOR)).toBe(false);
    });
  });

  describe('canManageProjects', () => {
    it('项目管理员可以管理项目', () => {
      expect(PermissionService.canManageProjects(UserRole.PROJECT_ADMIN)).toBe(true);
    });

    it('系统管理员可以管理项目', () => {
      expect(PermissionService.canManageProjects(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('审核员不能管理项目', () => {
      expect(PermissionService.canManageProjects(UserRole.REVIEWER)).toBe(false);
    });

    it('标注员不能管理项目', () => {
      expect(PermissionService.canManageProjects(UserRole.ANNOTATOR)).toBe(false);
    });
  });

  describe('canManageTeam', () => {
    it('系统管理员可以管理团队', () => {
      expect(PermissionService.canManageTeam(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('项目管理员如果是团队管理员可以管理团队', () => {
      expect(PermissionService.canManageTeam(UserRole.PROJECT_ADMIN, 'admin')).toBe(true);
    });

    it('项目管理员如果不是团队管理员不能管理团队', () => {
      expect(PermissionService.canManageTeam(UserRole.PROJECT_ADMIN, 'member')).toBe(false);
    });

    it('审核员不能管理团队', () => {
      expect(PermissionService.canManageTeam(UserRole.REVIEWER)).toBe(false);
    });

    it('标注员不能管理团队', () => {
      expect(PermissionService.canManageTeam(UserRole.ANNOTATOR)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('系统管理员可以管理用户', () => {
      expect(PermissionService.canManageUsers(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('项目管理员不能管理用户', () => {
      expect(PermissionService.canManageUsers(UserRole.PROJECT_ADMIN)).toBe(false);
    });

    it('审核员不能管理用户', () => {
      expect(PermissionService.canManageUsers(UserRole.REVIEWER)).toBe(false);
    });

    it('标注员不能管理用户', () => {
      expect(PermissionService.canManageUsers(UserRole.ANNOTATOR)).toBe(false);
    });
  });

  describe('canManageSystem', () => {
    it('系统管理员可以管理系统', () => {
      expect(PermissionService.canManageSystem(UserRole.SYSTEM_ADMIN)).toBe(true);
    });

    it('项目管理员不能管理系统', () => {
      expect(PermissionService.canManageSystem(UserRole.PROJECT_ADMIN)).toBe(false);
    });

    it('审核员不能管理系统', () => {
      expect(PermissionService.canManageSystem(UserRole.REVIEWER)).toBe(false);
    });

    it('标注员不能管理系统', () => {
      expect(PermissionService.canManageSystem(UserRole.ANNOTATOR)).toBe(false);
    });
  });
});