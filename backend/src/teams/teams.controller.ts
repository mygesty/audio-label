import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: '创建团队' })
  @ApiResponse({ status: 201, description: '团队创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async createTeam(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    const userId = req.user.sub;
    return this.teamsService.createTeam(userId, createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: '获取团队列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTeams(@Request() req, @Query() queryDto: QueryTeamDto) {
    const userId = req.user.sub;
    return this.teamsService.getTeams(userId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取团队详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async getTeamDetail(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.teamsService.getTeamDetail(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新团队信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async updateTeam(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const userId = req.user.sub;
    return this.teamsService.updateTeam(userId, id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除团队' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async deleteTeam(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.teamsService.deleteTeam(userId, id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: '邀请成员' })
  @ApiResponse({ status: 201, description: '邀请成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队或用户不存在' })
  @ApiResponse({ status: 409, description: '用户已是团队成员' })
  async inviteMembers(
    @Request() req,
    @Param('id') id: string,
    @Body() inviteDto: InviteMemberDto,
  ) {
    const userId = req.user.sub;
    return this.teamsService.inviteMembers(userId, id, inviteDto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: '获取团队成员列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队不存在' })
  async getTeamMembers(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.teamsService.getTeamMembers(userId, id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: '移除成员' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: '移除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队或成员不存在' })
  async removeMember(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    const currentUserId = req.user.sub;
    return this.teamsService.removeMember(currentUserId, id, userId);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({ summary: '更新成员角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权限' })
  @ApiResponse({ status: 404, description: '团队或成员不存在' })
  async updateMemberRole(
    @Request() req,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    const currentUserId = req.user.sub;
    return this.teamsService.updateMemberRole(currentUserId, id, userId, updateRoleDto);
  }
}