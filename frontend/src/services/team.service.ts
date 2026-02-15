import http from './http';
import type {
  Team,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  QueryTeamRequest,
} from '../types/team';
import { TeamMemberRole } from '../types/team';

/**
 * 团队管理服务
 */
class TeamService {
  private readonly baseUrl = '/teams';

  /**
   * 创建团队
   */
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await http.post<Team>(this.baseUrl, data);
    return response.data;
  }

  /**
   * 获取团队列表
   */
  async getTeams(params?: QueryTeamRequest): Promise<Team[]> {
    const response = await http.get<Team[]>(this.baseUrl, { params });
    return response.data;
  }

  /**
   * 获取团队详情
   */
  async getTeamDetail(teamId: string): Promise<Team> {
    const response = await http.get<Team>(`${this.baseUrl}/${teamId}`);
    return response.data;
  }

  /**
   * 更新团队信息
   */
  async updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
    const response = await http.patch<Team>(`${this.baseUrl}/${teamId}`, data);
    return response.data;
  }

  /**
   * 删除团队
   */
  async deleteTeam(teamId: string): Promise<void> {
    await http.delete(`${this.baseUrl}/${teamId}`);
  }

  /**
   * 邀请成员
   */
  async inviteMembers(teamId: string, data: InviteMemberRequest): Promise<TeamMember[]> {
    const response = await http.post<TeamMember[]>(`${this.baseUrl}/${teamId}/invite`, data);
    return response.data;
  }

  /**
   * 获取团队成员列表
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await http.get<TeamMember[]>(`${this.baseUrl}/${teamId}/members`);
    return response.data;
  }

  /**
   * 移除成员
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    await http.delete(`${this.baseUrl}/${teamId}/members/${userId}`);
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(teamId: string, userId: string, data: UpdateMemberRoleRequest): Promise<TeamMember> {
    const response = await http.patch<TeamMember>(`${this.baseUrl}/${teamId}/members/${userId}/role`, data);
    return response.data;
  }

  /**
   * 批量邀请成员
   */
  async batchInviteMembers(teamId: string, emails: string[], role: TeamMemberRole = TeamMemberRole.MEMBER): Promise<TeamMember[]> {
    return this.inviteMembers(teamId, { emails, role });
  }

  /**
   * 批量移除成员
   */
  async batchRemoveMembers(teamId: string, userIds: string[]): Promise<void> {
    await Promise.all(userIds.map(userId => this.removeMember(teamId, userId)));
  }

  /**
   * 批量更新成员角色
   */
  async batchUpdateMemberRoles(teamId: string, updates: { userId: string; role: TeamMemberRole }[]): Promise<TeamMember[]> {
    return Promise.all(
      updates.map(({ userId, role }) => this.updateMemberRole(teamId, userId, { role }))
    );
  }
}

export default new TeamService();