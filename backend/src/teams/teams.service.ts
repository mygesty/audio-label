import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember, TeamMemberRole } from './entities/team-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { QueryTeamDto } from './dto/query-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建团队
   */
  async createTeam(userId: string, createTeamDto: CreateTeamDto): Promise<Team> {
    const team = new Team();
    team.name = createTeamDto.name;
    team.description = createTeamDto.description;
    team.ownerId = userId;
    team.settings = {};

    const savedTeam = await this.teamRepository.save(team);

    // 自动将创建者添加为管理员
    const member = this.teamMemberRepository.create({
      teamId: savedTeam.id,
      userId: userId,
      role: TeamMemberRole.ADMIN,
    });
    await this.teamMemberRepository.save(member);

    return savedTeam;
  }

  /**
   * 获取团队列表
   */
  async getTeams(userId: string, queryDto: QueryTeamDto): Promise<Team[]> {
    // 先获取用户所属的团队ID列表
    const teamMembers = await this.teamMemberRepository.find({
      where: { userId },
      select: ['teamId'],
    });

    const teamIds = teamMembers.map(tm => tm.teamId);

    if (teamIds.length === 0) {
      return [];
    }

    // 获取团队信息
    const queryBuilder = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'owner')
      .leftJoinAndSelect('team.teamMembers', 'teamMembers')
      .where('team.id IN (:...teamIds)', { teamIds });

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(team.name LIKE :search OR team.description LIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    return queryBuilder.orderBy('team.createdAt', 'DESC').getMany();
  }

  /**
   * 获取团队详情
   */
  async getTeamDetail(userId: string, teamId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['owner', 'teamMembers', 'teamMembers.user'],
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队成员
    const isMember = team.teamMembers.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('您不是该团队成员');
    }

    return team;
  }

  /**
   * 更新团队信息
   */
  async updateTeam(
    userId: string,
    teamId: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队管理员或所有者
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member || (member.role !== TeamMemberRole.ADMIN && team.ownerId !== userId)) {
      throw new ForbiddenException('只有团队管理员或所有者可以更新团队信息');
    }

    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  /**
   * 删除团队
   */
  async deleteTeam(userId: string, teamId: string): Promise<void> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 只有团队所有者可以删除团队
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以删除团队');
    }

    await this.teamRepository.softDelete(teamId);
  }

  /**
   * 邀请成员
   */
  async inviteMembers(
    userId: string,
    teamId: string,
    inviteDto: InviteMemberDto,
  ): Promise<TeamMember[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队管理员或所有者
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member || (member.role !== TeamMemberRole.ADMIN && team.ownerId !== userId)) {
      throw new ForbiddenException('只有团队管理员或所有者可以邀请成员');
    }

    const newMembers: TeamMember[] = [];

    for (const email of inviteDto.emails) {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`用户 ${email} 不存在`);
      }

      // 检查用户是否已经是团队成员
      const existingMember = await this.teamMemberRepository.findOne({
        where: { teamId, userId: user.id },
      });

      if (existingMember) {
        throw new ConflictException(`用户 ${email} 已经是团队成员`);
      }

      // 创建团队成员
      const newMember = this.teamMemberRepository.create({
        teamId,
        userId: user.id,
        role: inviteDto.role,
      });
      const savedMember = await this.teamMemberRepository.save(newMember);
      newMembers.push(savedMember);
    }

    // 加载关联的用户信息
    const memberIds = newMembers.map(m => m.id);
    const membersWithUser = await this.teamMemberRepository.find({
      where: { id: In(memberIds) },
      relations: ['user'],
    });

    return membersWithUser;
  }

  /**
   * 移除成员
   */
  async removeMember(
    userId: string,
    teamId: string,
    targetUserId: string,
  ): Promise<void> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队管理员或所有者
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member || (member.role !== TeamMemberRole.ADMIN && team.ownerId !== userId)) {
      throw new ForbiddenException('只有团队管理员或所有者可以移除成员');
    }

    // 不能移除团队所有者
    if (targetUserId === team.ownerId) {
      throw new ForbiddenException('不能移除团队所有者');
    }

    const targetMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('目标成员不存在');
    }

    await this.teamMemberRepository.delete(targetMember.id);
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(
    userId: string,
    teamId: string,
    targetUserId: string,
    updateRoleDto: UpdateMemberRoleDto,
  ): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队管理员或所有者
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member || (member.role !== TeamMemberRole.ADMIN && team.ownerId !== userId)) {
      throw new ForbiddenException('只有团队管理员或所有者可以更新成员角色');
    }

    // 不能修改团队所有者的角色
    if (targetUserId === team.ownerId) {
      throw new ForbiddenException('不能修改团队所有者的角色');
    }

    const targetMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('目标成员不存在');
    }

    targetMember.role = updateRoleDto.role;
    const savedMember = await this.teamMemberRepository.save(targetMember);
    
    // 加载关联的用户信息
    const memberWithUser = await this.teamMemberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user'],
    });

    return memberWithUser;
  }

  /**
   * 获取团队成员列表
   */
  async getTeamMembers(userId: string, teamId: string): Promise<TeamMember[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('团队不存在');
    }

    // 检查用户是否是团队成员
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    if (!member) {
      throw new ForbiddenException('您不是该团队成员');
    }

    return this.teamMemberRepository.find({
      where: { teamId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }
}