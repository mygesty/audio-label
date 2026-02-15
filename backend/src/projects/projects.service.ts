import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { TeamMember, TeamMemberRole } from '../teams/entities/team-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { AddProjectMemberDto, UpdateProjectMemberDto, BatchAddProjectMembersDto } from './dto/project-member.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  /**
   * 创建项目
   */
  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      createdBy: userId,
    });

    return await this.projectRepository.save(project);
  }

  /**
   * 获取项目列表（支持分页和过滤）
   */
  async findAll(query: QueryProjectDto): Promise<{ data: Project[]; total: number; page: number; pageSize: number }> {
    const { teamId, name, status, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.team', 'team')
      .leftJoinAndSelect('project.creator', 'creator')
      .select([
        'project.id',
        'project.teamId',
        'project.name',
        'project.description',
        'project.status',
        'project.createdAt',
        'project.updatedAt',
        'team.id',
        'team.name',
        'creator.id',
        'creator.username',
      ]);

    // 过滤条件
    if (teamId) {
      queryBuilder.andWhere('project.teamId = :teamId', { teamId });
    }

    if (name) {
      queryBuilder.andWhere('project.name LIKE :name', { name: `%${name}%` });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    // 软删除过滤
    queryBuilder.andWhere('project.deletedAt IS NULL');

    // 分页
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    // 排序
    queryBuilder.orderBy('project.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取项目详情
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team', 'creator'],
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    return project;
  }

  /**
   * 更新项目
   */
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    Object.assign(project, updateProjectDto);

    return await this.projectRepository.save(project);
  }

  /**
   * 删除项目（软删除）
   */
  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    
    await this.projectRepository.softRemove(project);
  }

  /**
   * 统计团队项目数量
   */
  async countByTeam(teamId: string): Promise<number> {
    return await this.projectRepository.count({
      where: { teamId },
    });
  }

  /**
   * 获取项目成员列表
   * 注意：项目成员实际上是团队成员，所以通过 teamId 获取团队成员
   */
  async getProjectMembers(projectId: string) {
    const project = await this.findOne(projectId);
    
    const members = await this.teamMemberRepository.find({
      where: { teamId: project.teamId },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        role: true,
        joinedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
        },
      },
    });

    return members;
  }

  /**
   * 添加项目成员
   */
  async addMember(projectId: string, addMemberDto: AddProjectMemberDto) {
    const project = await this.findOne(projectId);

    // 检查成员是否已存在
    const existingMember = await this.teamMemberRepository.findOne({
      where: {
        teamId: project.teamId,
        userId: addMemberDto.userId,
      },
    });

    if (existingMember) {
      throw new BadRequestException('该成员已在团队中');
    }

    const teamMember = this.teamMemberRepository.create({
      teamId: project.teamId,
      userId: addMemberDto.userId,
      role: addMemberDto.role === 'admin' ? TeamMemberRole.ADMIN : TeamMemberRole.MEMBER,
    });

    return await this.teamMemberRepository.save(teamMember);
  }

  /**
   * 批量添加项目成员
   */
  async addMembersBatch(projectId: string, batchAddDto: BatchAddProjectMembersDto) {
    const project = await this.findOne(projectId);
    const results = [];

    for (const memberDto of batchAddDto.members) {
      // 检查成员是否已存在
      const existingMember = await this.teamMemberRepository.findOne({
        where: {
          teamId: project.teamId,
          userId: memberDto.userId,
        },
      });

      if (existingMember) {
        continue; // 跳过已存在的成员
      }

      const teamMember = this.teamMemberRepository.create({
        teamId: project.teamId,
        userId: memberDto.userId,
        role: memberDto.role === 'admin' ? TeamMemberRole.ADMIN : TeamMemberRole.MEMBER,
      });

      results.push(await this.teamMemberRepository.save(teamMember));
    }

    return results;
  }

  /**
   * 移除项目成员
   */
  async removeMember(projectId: string, userId: string) {
    const project = await this.findOne(projectId);

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId: project.teamId,
        userId: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    await this.teamMemberRepository.remove(member);
  }

  /**
   * 更新项目成员角色
   */
  async updateMemberRole(projectId: string, userId: string, updateDto: UpdateProjectMemberDto) {
    const project = await this.findOne(projectId);

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId: project.teamId,
        userId: userId,
      },
    });

    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    member.role = updateDto.role === 'admin' ? TeamMemberRole.ADMIN : TeamMemberRole.MEMBER;

    return await this.teamMemberRepository.save(member);
  }
}