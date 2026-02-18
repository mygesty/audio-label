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
  Headers,
  Res,
  HttpException,
  Options,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AudioService } from './audio.service';
import { CreateAudioFileDto } from './dto/create-audio-file.dto';
import { UpdateAudioFileDto } from './dto/update-audio-file.dto';
import { QueryAudioFileDto } from './dto/query-audio-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';
import * as mm from 'music-metadata';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

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
    const storagePath = data?.storagePath?.value || '';

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
    const storageKey = `${randomName}${ext}`;
    const filePath = path.join(uploadDir, storageKey);

    // 保存文件
    const buffer = await file.toBuffer();
    fs.writeFileSync(filePath, buffer);

    // 获取音频时长（使用 music-metadata 库）
    let duration = 0;
    try {
      const metadata = await mm.parseFile(filePath);
      duration = metadata.format.duration || 0;
      // 四舍五入到两位小数
      duration = Math.round(duration * 100) / 100;
      console.log('音频时长:', duration, '秒');
    } catch (error) {
      console.error('获取音频时长失败:', error);
      // 时长获取失败不影响上传流程，duration 保持为 0
    }

    // 创建音频文件记录
    const createAudioFileDto: CreateAudioFileDto = {
      name: file.filename,
      storagePath: storagePath,
      storageKey: storageKey,
      fileSize: file.file.bytesRead,
      fileType: file.mimetype,
      duration: duration > 0 ? duration : undefined,
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
   * 更新音频文件时长
   * PATCH /api/audio/:id/duration
   */
  @Patch(':id/duration')
  @HttpCode(HttpStatus.OK)
  async updateAudioDuration(@Param('id') id: string) {
    return await this.audioService.updateAudioDuration(id);
  }

  // ============ 音频播放与下载 ============

  /**
   * 处理音频流预检请求
   * OPTIONS /api/audio/:id/stream
   */
  @Options(':id/stream')
  async streamAudioOptions(
    @Res({ passthrough: false }) reply: FastifyReply,
  ) {
    const raw = reply.raw;
    raw.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    raw.end();
  }

  /**
   * 音频流式传输（支持范围请求）
   * GET /api/audio/:id/stream
   */
  @Get(':id/stream')
  async streamAudio(
    @Param('id') id: string,
    @Headers('range') range: string,
    @Res({ passthrough: false }) reply: FastifyReply, // passthrough: false 确保完全接管响应
  ): Promise<void> { // 关键：返回 Promise<void>，明确无返回值
    try {
      const { filePath, audioFile } = await this.audioService.getAudioFilePath(id);

      // 校验文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new HttpException('音频文件不存在', HttpStatus.NOT_FOUND);
      }

      // 获取文件信息
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const contentType = audioFile.fileType || 'audio/mpeg';

      // 获取原始 Node.js 响应对象
      const raw = reply.raw;

      // 监听原始响应的错误，避免崩溃
      raw.on('error', (err) => {
        console.error('响应流错误:', err);
      });

      // 处理范围请求
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        // 验证范围有效性
        if (isNaN(start) || start >= fileSize || end >= fileSize) {
          raw.writeHead(416, {
            'Content-Range': `bytes */${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': contentType,
          });
          raw.end(); // 手动结束响应
          return; // 终止函数执行
        }

        // 创建范围读取流
        const stream = fs.createReadStream(filePath, { start, end });

        // 监听流错误
        stream.on('error', (err) => {
          console.error('文件流错误:', err);
          if (!raw.headersSent) {
            raw.writeHead(500, { 'Content-Type': 'application/json' });
            raw.end(JSON.stringify({ message: '文件读取失败' }));
          } else {
            raw.destroy(err);
          }
        });

        // 设置 206 部分内容响应头
        raw.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });

        // 管道传输并监听结束
        stream.pipe(raw);
      } else {
        // 普通请求（完整文件）
        const stream = fs.createReadStream(filePath);

        // 监听流错误
        stream.on('error', (err) => {
          console.error('文件流错误:', err);
          if (!raw.headersSent) {
            raw.writeHead(500, { 'Content-Type': 'application/json' });
            raw.end(JSON.stringify({ message: '文件读取失败' }));
          } else {
            raw.destroy(err);
          }
        });

        // 设置 200 响应头
        raw.writeHead(200, {
          'Accept-Ranges': 'bytes',
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        });

        // 管道传输
        stream.pipe(raw);
      }

      // 关键：返回一个 Promise，直到响应结束才resolve，阻止 NestJS 执行默认 send()
      await new Promise((resolve) => {
        raw.on('finish', resolve); // 响应完成后resolve
        raw.on('close', resolve);  // 响应关闭后resolve
      });

    } catch (error) {
      // 统一异常处理（确保响应未发送时才设置头）
      const raw = reply.raw;
      if (!raw.headersSent) {
        raw.writeHead(
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          { 'Content-Type': 'application/json' },
        );
        raw.end(JSON.stringify({
          message: error.message || '音频流传输失败',
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        }));
      }
      // 抛出异常前确保 Promise 完成（避免 NestJS 额外处理）
      throw error;
    }
  }

  /**
   * 处理音频下载预检请求
   * OPTIONS /api/audio/:id/download
   */
  @Options(':id/download')
  async downloadAudioOptions(
    @Res({ passthrough: false }) reply: FastifyReply,
  ) {
    const raw = reply.raw;
    raw.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    raw.end();
  }

  /**
   * 音频下载
   * GET /api/audio/:id/download
   */
  @Get(':id/download')
  async downloadAudio(
    @Param('id') id: string,
    @Res({ passthrough: false }) reply: FastifyReply,
  ) {
    const { filePath, audioFile } = await this.audioService.getAudioFilePath(id);

    // 获取文件信息
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const contentType = audioFile.fileType || 'application/octet-stream';

    // 获取原始 Node.js 响应对象
    const raw = reply.raw;

    // 创建可读流
    const stream = fs.createReadStream(filePath);

    // 设置响应头（强制下载，包含 CORS）
    raw.writeHead(200, {
      'Content-Length': fileSize.toString(),
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(audioFile.name)}"`,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    // 流式传输
    stream.pipe(raw);
  }
}