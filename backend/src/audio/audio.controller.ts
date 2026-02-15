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
  BadRequestException,
} from '@nestjs/common';
import { AudioService } from './audio.service';
import { CreateAudioFileDto } from './dto/create-audio-file.dto';
import { UpdateAudioFileDto } from './dto/update-audio-file.dto';
import { CreateAudioFolderDto } from './dto/create-audio-folder.dto';
import { UpdateAudioFolderDto } from './dto/update-audio-folder.dto';
import { QueryAudioFileDto } from './dto/query-audio-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  // ============ 文件夹管理 ============

  /**
   * 创建文件夹
   * POST /api/audio/folders
   */
  @Post('folders')
  @HttpCode(HttpStatus.CREATED)
  async createFolder(
    @Body() createAudioFolderDto: CreateAudioFolderDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.audioService.createFolder(
      createAudioFolderDto,
      createAudioFolderDto.projectId,
      userId,
    );
  }

  /**
   * 获取文件夹列表
   * GET /api/audio/folders
   */
  @Get('folders')
  async findFolders(@Query('projectId') projectId: string) {
    if (!projectId) {
      throw new BadRequestException('项目ID是必需的');
    }
    return this.audioService.findFolders(projectId);
  }

  /**
   * 获取文件夹详情
   * GET /api/audio/folders/:id
   */
  @Get('folders/:id')
  async findFolderById(@Param('id') id: string) {
    return this.audioService.findFolderById(id);
  }

  /**
   * 更新文件夹
   * PATCH /api/audio/folders/:id
   */
  @Patch('folders/:id')
  @HttpCode(HttpStatus.OK)
  async updateFolder(
    @Param('id') id: string,
    @Body() updateAudioFolderDto: UpdateAudioFolderDto,
  ) {
    return this.audioService.updateFolder(id, updateAudioFolderDto);
  }

  /**
   * 删除文件夹
   * DELETE /api/audio/folders/:id
   */
  @Delete('folders/:id')
  @HttpCode(HttpStatus.OK)
  async removeFolder(@Param('id') id: string) {
    await this.audioService.removeFolder(id);
    return { message: '文件夹删除成功' };
  }

  // ============ 音频文件管理 ============

  /**
   * 上传音频文件
   * POST /api/audio/upload
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@Request() req: any) {
    // 获取上传的文件
    const data = req.body;
    const file = data.file; // Fastify multipart: 文件会在 req.file 中

    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // Fastify multipart: fields 会在 data 对象中
    const projectId = data?.projectId?.value;
    const folderId = data?.folderId?.value;

    if (!projectId) {
      throw new BadRequestException('项目ID是必需的');
    }

    const userId = req.user.sub;

    // 保存文件到磁盘
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');

    const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成随机文件名
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.filename);
    const filePath = path.join(uploadDir, `${randomName}${ext}`);

    // 保存文件
    const buffer = await file.toBuffer();
    fs.writeFileSync(filePath, buffer);

    // 创建音频文件记录
    const createAudioFileDto: CreateAudioFileDto = {
      name: file.filename,
      filePath: filePath,
      fileSize: file.file.bytesRead,
      fileType: file.mimetype,
      folderId: folderId,
    };

    const audioFile = await this.audioService.create(
      createAudioFileDto,
      projectId,
      userId,
    );

    // 更新上传进度为 100%
    await this.audioService.updateUploadProgress(audioFile.id, 100);

    return audioFile;
  }

  /**
   * 获取音频文件列表
   * GET /api/audio
   */
  @Get()
  async findAll(@Query() query: QueryAudioFileDto) {
    return this.audioService.findAll(query);
  }

  /**
   * 获取音频文件详情
   * GET /api/audio/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.audioService.findOne(id);
  }

  /**
   * 更新音频文件
   * PATCH /api/audio/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateAudioFileDto: UpdateAudioFileDto,
  ) {
    return this.audioService.update(id, updateAudioFileDto);
  }

  /**
   * 删除音频文件（软删除）
   * DELETE /api/audio/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.audioService.remove(id);
    return { message: '音频文件删除成功' };
  }

  /**
   * 更新上传进度
   * PATCH /api/audio/:id/progress
   */
  @Patch(':id/progress')
  @HttpCode(HttpStatus.OK)
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
  ) {
    return this.audioService.updateUploadProgress(id, body.progress);
  }

  /**
   * 统计项目音频文件数量
   * GET /api/audio/stats/project/:projectId
   */
  @Get('stats/project/:projectId')
  async countByProject(@Param('projectId') projectId: string) {
    const count = await this.audioService.countByProject(projectId);
    return { projectId, count };
  }

  /**
   * 统计文件夹音频文件数量
   * GET /api/audio/stats/folder/:folderId
   */
  @Get('stats/folder/:folderId')
  async countByFolder(@Param('folderId') folderId: string) {
    const count = await this.audioService.countByFolder(folderId);
    return { folderId, count };
  }
}