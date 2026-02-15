import { SetMetadata } from '@nestjs/common';
import { RESOURCE_KEY, RESOURCE_ACTION_KEY, ResourceRequirement, ResourceActionRequirement, ResourceType, ResourceAction as ResourceActionEnum } from '../guards/resource.guard';

/**
 * 装饰器：指定路由需要检查资源访问权限
 * @param type 资源类型
 * @param param 包含资源 ID 的参数名（默认为 'id'）
 */
export const Resource = (type: ResourceType, param?: string) =>
  SetMetadata(RESOURCE_KEY, { type, param } as ResourceRequirement);

/**
 * 装饰器：指定路由的资源操作类型
 * @param action 操作类型
 */
export const ResourceAction = (action: ResourceActionEnum) =>
  SetMetadata(RESOURCE_ACTION_KEY, { action } as ResourceActionRequirement);