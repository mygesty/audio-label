import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import {
  AddProjectMemberDto,
  UpdateProjectMemberDto,
  BatchAddProjectMembersDto,
} from './dto/project-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * 创建项目
   * POST /api/projects
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.projectsService.create(createProjectDto, userId);
  }

  /**
   * 获取项目列表
   * GET /api/projects
   */
  @Get()
  async findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  /**
   * 获取项目详情
   * GET /api/projects/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * 更新项目
   * PATCH /api/projects/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  /**
   * 删除项目（软删除）
   * DELETE /api/projects/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
    return { message: '项目删除成功' };
  }

  /**
   * 获取项目成员列表
   * GET /api/projects/:id/members
   */
  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    const members = await this.projectsService.getProjectMembers(id);
    return {
      data: members,
      total: members.length,
    };
  }

  /**
   * 添加项目成员
   * POST /api/projects/:id/members
   */
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddProjectMemberDto,
  ) {
    return await this.projectsService.addMember(id, addMemberDto);
  }

  /**
   * 批量添加项目成员
   * POST /api/projects/:id/members/batch
   */
  @Post(':id/members/batch')
  @HttpCode(HttpStatus.CREATED)
  async addMembersBatch(
    @Param('id') id: string,
    @Body() batchAddDto: BatchAddProjectMembersDto,
  ) {
    return await this.projectsService.addMembersBatch(id, batchAddDto);
  }

  /**
   * 移除项目成员
   * DELETE /api/projects/:id/members/:userId
   */
  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.projectsService.removeMember(id, userId);
    return { message: '成员移除成功' };
  }

  /**
   * 更新项目成员角色
   * PATCH /api/projects/:id/members/:userId
   */
  @Patch(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateProjectMemberDto,
  ) {
    return await this.projectsService.updateMemberRole(id, userId, updateDto);
  }
}