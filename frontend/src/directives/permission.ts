import type { Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '../stores/user';
import PermissionService from '../services/permission.service';
import { UserRole } from '../types/permission';

/**
 * 权限指令：v-permission
 *
 * 使用方式：
 * <button v-permission="'reviewer'">仅审核员可见</button>
 * <button v-permission="['reviewer', 'admin']">审核员或管理员可见</button>
 */
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore();
    const { value } = binding;

    if (!value) {
      return;
    }

    const roles = Array.isArray(value) ? value : [value];
    const userRole = userStore.user?.role;

    if (!userRole) {
      // 用户未登录，隐藏元素
      el.style.display = 'none';
      return;
    }

    const hasPermission = roles.some((role) => {
      // 支持字符串和枚举
      const requiredRole = typeof role === 'string' ? role : role.toString();
      const currentRole = typeof userRole === 'string' ? userRole : userRole.toString();

      // 检查角色匹配
      if (requiredRole === currentRole) {
        return true;
      }

      // 检查层级权限（系统管理员 > 项目管理员 > 审核员 > 标注员）
      const roleHierarchy: Record<string, number> = {
        [UserRole.ANNOTATOR]: 1,
        [UserRole.REVIEWER]: 2,
        [UserRole.PROJECT_ADMIN]: 3,
        [UserRole.SYSTEM_ADMIN]: 4,
      };

      const currentLevel = roleHierarchy[currentRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      return currentLevel >= requiredLevel;
    });

    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
};

/**
 * 角色权限指令：v-role
 *
 * 使用方式：
 * <button v-role="'reviewer'">仅审核员可见</button>
 */
export const roleDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore();
    const { value } = binding;

    if (!value) {
      return;
    }

    const userRole = userStore.user?.role;

    if (!userRole) {
      el.style.display = 'none';
      return;
    }

    const hasPermission = PermissionService.hasPermissionByRole(
      userRole,
      'any',
      'read',
    );

    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
};

/**
 * 功能权限指令：v-can
 *
 * 使用方式：
 * <button v-can="'review'">可以审核</button>
 * <button v-can="'assignTasks'">可以分配任务</button>
 * <button v-can="'manageProjects'">可以管理项目</button>
 */
export const canDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore();
    const { value } = binding;

    if (!value) {
      return;
    }

    const userRole = userStore.user?.role;
    const teamRole = userStore.user?.teamRole;

    if (!userRole) {
      el.style.display = 'none';
      return;
    }

    let hasPermission = false;

    switch (value) {
      case 'review':
        hasPermission = PermissionService.canReview(userRole);
        break;
      case 'assignTasks':
        hasPermission = PermissionService.canAssignTasks(userRole);
        break;
      case 'manageProjects':
        hasPermission = PermissionService.canManageProjects(userRole);
        break;
      case 'manageTeam':
        hasPermission = PermissionService.canManageTeam(userRole, teamRole);
        break;
      case 'manageUsers':
        hasPermission = PermissionService.canManageUsers(userRole);
        break;
      case 'manageSystem':
        hasPermission = PermissionService.canManageSystem(userRole);
        break;
      default:
        hasPermission = false;
    }

    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
};

/**
 * 资源权限指令：v-resource
 *
 * 使用方式：
 * <button v-resource="{ type: 'project', action: 'delete' }">删除项目</button>
 * <button v-resource="{ type: 'task', action: 'update' }">更新任务</button>
 */
export const resourceDirective: Directive = {
  async mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;

    if (!value) {
      return;
    }

    const { type, action } = value;

    try {
      const userStore = useUserStore();
      const userRole = userStore.user?.role;

      if (!userRole) {
        el.style.display = 'none';
        return;
      }

      // 先进行本地快速检查
      const hasLocalPermission = PermissionService.hasPermissionByRole(userRole, type, action);

      if (!hasLocalPermission) {
        el.style.display = 'none';
        return;
      }

      // 如果需要精确检查，可以调用后端 API（可选）
      // const response = await PermissionService.checkPermission({
      //   resourceType: type,
      //   resourceId: 'temp', // 这里需要根据实际情况传入
      //   action: action,
      // });
      // if (!response.allowed) {
      //   el.style.display = 'none';
      // }
    } catch (error) {
      console.error('Resource permission check failed:', error);
      el.style.display = 'none';
    }
  },
};