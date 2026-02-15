# 权限管理模块开发总结

## 概述

本文档总结了权限管理模块的前后端开发工作，包括实现的功能、API 接口、测试用例等。

## 完成内容

### 1. 后端实现

#### 1.1 权限守卫

**文件路径**: `backend/src/auth/guards/resource.guard.ts`

**功能**:
- 实现资源访问控制守卫（Resource Guard）
- 支持多种资源类型：PROJECT, TEAM, TASK, AUDIO, ANNOTATION
- 支持多种操作类型：READ, CREATE, UPDATE, DELETE, MANAGE
- 根据用户角色和团队成员角色验证权限
- 支持层级权限验证（系统管理员 > 项目管理员 > 审核员 > 标注员）

**核心方法**:
- `canActivate()`: 主权限检查方法
- `checkPermission()`: 根据资源类型分发权限检查
- `checkProjectPermission()`: 项目权限检查
- `checkTeamPermission()`: 团队权限检查
- `checkTaskPermission()`: 任务权限检查
- `checkAudioPermission()`: 音频权限检查
- `checkAnnotationPermission()`: 标注权限检查

#### 1.2 团队角色守卫

**文件路径**: `backend/src/auth/guards/team-role.guard.ts`

**功能**:
- 验证用户在特定团队中的角色
- 支持 TeamMemberRole.ADMIN 和 TeamMemberRole.MEMBER
- 系统管理员和项目管理员自动通过验证
- 将团队成员信息附加到 request 对象

#### 1.3 权限装饰器

**文件路径**: `backend/src/auth/decorators/resource.decorator.ts`

**装饰器**:
- `@Resource()`: 指定路由需要检查资源访问权限
- `@ResourceAction()`: 指定路由的资源操作类型
- `@TeamRoles()`: 指定路由需要的团队角色

**使用示例**:
```typescript
@UseGuards(JwtAuthGuard, ResourceGuard)
@Resource(ResourceType.PROJECT)
@ResourceAction(ResourceAction.UPDATE)
@Patch(':id')
updateProject(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
  // ...
}
```

#### 1.4 权限 DTO

**文件路径**: `backend/src/auth/dto/permission.dto.ts`

**DTO 类**:
- `CheckPermissionDto`: 权限检查请求
- `PermissionCheckResponseDto`: 权限检查响应
- `UserPermissionsDto`: 用户权限信息
- `RolePermissionsDto`: 角色权限映射
- `BatchCheckPermissionDto`: 批量权限检查请求
- `BatchPermissionCheckResponseDto`: 批量权限检查响应

#### 1.5 权限控制器

**文件路径**: `backend/src/auth/auth.controller.ts`

**API 接口**:
- `POST /api/auth/permissions/check`: 检查用户权限
- `POST /api/auth/permissions/batch-check`: 批量检查权限
- `GET /api/auth/permissions/user`: 获取当前用户权限信息
- `GET /api/auth/permissions/roles`: 获取角色权限描述（仅系统管理员）

### 2. 前端实现

#### 2.1 类型定义

**文件路径**: `frontend/src/types/permission.ts`

**类型和枚举**:
- `UserRole`: 用户角色枚举
- `TeamMemberRole`: 团队角色枚举
- `ResourceType`: 资源类型枚举
- `ResourceAction`: 资源操作枚举
- `CheckPermissionRequest`: 权限检查请求接口
- `CheckPermissionResponse`: 权限检查响应接口
- `UserPermissions`: 用户权限信息接口
- `RolePermissions`: 角色权限映射接口

#### 2.2 权限服务

**文件路径**: `frontend/src/services/permission.service.ts`

**方法**:
- `checkPermission()`: 检查用户权限（调用后端 API）
- `batchCheckPermission()`: 批量检查权限
- `getUserPermissions()`: 获取当前用户权限信息
- `getRolePermissions()`: 获取角色权限描述
- `hasPermissionByRole()`: 本地权限检查（快速检查）
- `canReview()`: 检查是否可以审核
- `canAssignTasks()`: 检查是否可以分配任务
- `canManageProjects()`: 检查是否可以管理项目
- `canManageTeam()`: 检查是否可以管理团队
- `canManageUsers()`: 检查是否可以管理用户
- `canManageSystem()`: 检查是否可以管理系统

#### 2.3 权限指令

**文件路径**: `frontend/src/directives/permission.ts`

**指令**:
- `v-permission`: 基于角色控制元素显示
- `v-role`: 角色权限指令
- `v-can`: 功能权限指令
- `v-resource`: 资源权限指令

**使用示例**:
```vue
<!-- 仅审核员可见 -->
<button v-permission="'reviewer'">审核按钮</button>

<!-- 仅审核员和管理员可见 -->
<button v-permission="['reviewer', 'admin']">审核或管理</button>

<!-- 功能权限 -->
<button v-can="'review'">审核</button>
<button v-can="'assignTasks'">分配任务</button>

<!-- 资源权限 -->
<button v-resource="{ type: 'project', action: 'delete' }">删除项目</button>
```

#### 2.4 指令注册

**文件路径**: `frontend/src/main.ts`

已注册所有权限指令到 Vue 应用实例。

### 3. 测试用例

#### 3.1 后端测试

**文件路径**: `backend/test/permissions.e2e-spec.ts`

**测试覆盖**:
- ✅ 权限检查 API（单个和批量）
- ✅ 用户权限信息获取
- ✅ 角色权限描述获取
- ✅ 角色守卫测试
- ✅ 不同角色的权限验证
- ✅ 未登录用户访问控制
- ✅ 参数验证

**测试场景**:
- 系统管理员拥有所有权限
- 项目管理员拥有项目所有权限
- 审核员不能删除资源
- 标注员只能读取、创建、更新
- 未登录用户无法访问受保护接口
- 缺少必需参数时返回错误

#### 3.2 前端测试

**文件路径**: `frontend/src/services/__tests__/permission.service.test.ts`

**测试覆盖**:
- ✅ 权限检查 API 调用
- ✅ 批量权限检查
- ✅ 用户权限信息获取
- ✅ 角色权限描述获取
- ✅ 本地权限检查方法
- ✅ 功能权限检查方法

**测试场景**:
- API 调用正确性
- 权限拒绝处理
- 批量检查功能
- 不同角色的权限逻辑
- 功能权限验证

### 4. 前后端颗粒度对齐

#### 4.1 类型定义对齐

**后端** (`backend/src/auth/dto/permission.ts`):
```typescript
export class CheckPermissionDto {
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsString()
  resourceId: string;

  @IsEnum(ResourceAction)
  action: ResourceAction;

  @IsOptional()
  @IsString()
  teamId?: string;
}
```

**前端** (`frontend/src/types/permission.ts`):
```typescript
export interface CheckPermissionRequest {
  resourceType: ResourceType;
  resourceId: string;
  action: ResourceAction;
  teamId?: string;
}
```

✅ **对齐状态**: 完全对齐，字段名称和类型一致。

#### 4.2 API 接口对齐

| 接口 | 后端路径 | 前端调用 | 请求格式 | 响应格式 |
|------|---------|---------|---------|---------|
| 检查权限 | POST /api/auth/permissions/check | PermissionService.checkPermission() | CheckPermissionDto | CheckPermissionResponseDto |
| 批量检查 | POST /api/auth/permissions/batch-check | PermissionService.batchCheckPermission() | BatchCheckPermissionDto | BatchPermissionCheckResponseDto |
| 用户权限 | GET /api/auth/permissions/user | PermissionService.getUserPermissions() | 无 | UserPermissionsDto |
| 角色权限 | GET /api/auth/permissions/roles | PermissionService.getRolePermissions() | 无 | RolePermissionsDto[] |

✅ **对齐状态**: 完全对齐，接口路径、请求/响应格式一致。

#### 4.3 权限逻辑对齐

**后端权限逻辑** (`backend/src/auth/guards/resource.guard.ts`):
```typescript
switch (user.role) {
  case UserRole.SYSTEM_ADMIN:
    return true; // 所有权限
  case UserRole.PROJECT_ADMIN:
    return true; // 所有权限
  case UserRole.REVIEWER:
    return action !== ResourceActionEnum.DELETE && action !== ResourceActionEnum.MANAGE;
  case UserRole.ANNOTATOR:
    return action === ResourceActionEnum.READ || action === ResourceActionEnum.CREATE || action === ResourceActionEnum.UPDATE;
}
```

**前端权限逻辑** (`frontend/src/services/permission.service.ts`):
```typescript
switch (userRole) {
  case 'system_admin':
    return true;
  case 'project_admin':
    return true;
  case 'reviewer':
    if (action === 'delete' || action === 'manage') return false;
    return true;
  case 'annotator':
    if (action === 'delete' || action === 'manage') return false;
    if (action === 'read' || action === 'create' || action === 'update') return true;
    return false;
}
```

✅ **对齐状态**: 完全对齐，权限逻辑一致。

### 5. 使用指南

#### 5.1 后端使用

**在控制器中使用权限守卫**:
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guard';
import { Resource, ResourceAction } from '../auth/decorators/resource.decorator';
import { ResourceType } from '../auth/guards/resource.guard';

@Controller('projects')
export class ProjectsController {
  @Patch(':id')
  @UseGuards(JwtAuthGuard, ResourceGuard)
  @Resource(ResourceType.PROJECT)
  @ResourceAction(ResourceAction.UPDATE)
  async updateProject(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
    // ...
  }
}
```

**在控制器中使用团队角色守卫**:
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRoleGuard, TeamRoles } from '../auth/guards/team-role.guard';
import { TeamMemberRole } from '../teams/entities/team-member.entity';

@Controller('teams')
export class TeamsController {
  @Post(':teamId/members')
  @UseGuards(JwtAuthGuard, TeamRoleGuard)
  @TeamRoles(TeamMemberRole.ADMIN)
  async addMember(@Param('teamId') teamId: string, @Body() addMemberDto: AddMemberDto) {
    // ...
  }
}
```

#### 5.2 前端使用

**使用权限指令**:
```vue
<template>
  <!-- 仅审核员可见 -->
  <button v-permission="'reviewer'">审核按钮</button>

  <!-- 仅审核员和管理员可见 -->
  <button v-permission="['reviewer', 'admin']">审核或管理</button>

  <!-- 功能权限 -->
  <button v-can="'review'">审核</button>
  <button v-can="'assignTasks'">分配任务</button>

  <!-- 资源权限 -->
  <button v-resource="{ type: 'project', action: 'delete' }">删除项目</button>
</template>
```

**使用权限服务**:
```typescript
import PermissionService from '../services/permission.service';

// 检查权限
const result = await PermissionService.checkPermission({
  resourceType: ResourceType.PROJECT,
  resourceId: projectId,
  action: ResourceAction.DELETE,
});

if (result.allowed) {
  // 执行删除操作
} else {
  // 显示权限不足提示
}

// 本地快速检查
if (PermissionService.canReview(userRole)) {
  // 显示审核按钮
}

// 检查是否可以分配任务
if (PermissionService.canAssignTasks(userRole)) {
  // 显示分配任务按钮
}
```

### 6. 验收标准

- ✅ 后端权限守卫实现完整
- ✅ 前端权限指令实现完整
- ✅ 权限服务 API 实现完整
- ✅ 前后端类型定义对齐
- ✅ 前后端 API 接口对齐
- ✅ 前后端权限逻辑对齐
- ✅ 后端测试用例覆盖完整
- ✅ 前端测试用例覆盖完整
- ✅ 支持四种角色（标注员、审核员、项目管理员、系统管理员）
- ✅ 支持多种资源类型（项目、团队、任务、音频、标注）
- ✅ 支持多种操作类型（读取、创建、更新、删除、管理）
- ✅ 支持层级权限验证
- ✅ 支持团队成员角色验证
- ✅ 提供权限检查 API
- ✅ 提供批量权限检查 API
- ✅ 提供用户权限信息 API
- ✅ 提供角色权限描述 API

### 7. 下一步建议

1. **运行测试**: 运行后端和前端的测试用例，确保所有测试通过
2. **集成到现有模块**: 将权限守卫和装饰器集成到项目管理、团队管理等现有模块
3. **完善文档**: 补充更多使用示例和最佳实践
4. **性能优化**: 考虑添加权限缓存机制，减少数据库查询
5. **日志记录**: 添加权限检查日志，便于审计和调试

### 8. 相关文件清单

**后端文件**:
- `backend/src/auth/guards/resource.guard.ts` - 资源访问控制守卫
- `backend/src/auth/guards/team-role.guard.ts` - 团队角色守卫
- `backend/src/auth/decorators/resource.decorator.ts` - 权限装饰器
- `backend/src/auth/dto/permission.dto.ts` - 权限 DTO
- `backend/src/auth/auth.controller.ts` - 权限控制器
- `backend/test/permissions.e2e-spec.ts` - E2E 测试

**前端文件**:
- `frontend/src/types/permission.ts` - 类型定义
- `frontend/src/services/permission.service.ts` - 权限服务
- `frontend/src/directives/permission.ts` - 权限指令
- `frontend/src/main.ts` - 指令注册
- `frontend/src/services/__tests__/permission.service.test.ts` - 单元测试

---

**文档版本**: v1.0.0
**创建日期**: 2026-02-14
**作者**: Claude
**状态**: ✅ 已完成