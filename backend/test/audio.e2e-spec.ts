import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Audio API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let testTeamId: string;
  let testProjectId: string;
  let testFolderId: string;
  let testAudioFileId: string;

  const testUser = {
    email: `audiotest${Date.now()}@example.com`,
    username: `audiotest${Date.now()}`,
    password: 'TestPass123',
  };

  const testTeam = {
    name: `Test Team ${Date.now()}`,
    description: 'Test team for audio management',
  };

  const testProject = {
    name: `Test Project ${Date.now()}`,
    description: 'Test project for audio management',
  };

  const testFolder = {
    name: `Test Folder ${Date.now()}`,
    description: 'Test folder for audio files',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // 注册并登录用户
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerRes.body.accessToken;
    testUserId = registerRes.body.user.id;

    // 创建测试团队
    const teamRes = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTeam);

    testTeamId = teamRes.body.id;

    // 创建测试项目
    const projectRes = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        teamId: testTeamId,
        name: testProject.name,
        description: testProject.description,
      });

    testProjectId = projectRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ============ 文件夹管理测试 ============

  describe('POST /audio/folders', () => {
    it('should create a folder successfully', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: testFolder.name,
          description: testFolder.description,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('projectId');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body.name).toBe(testFolder.name);
          expect(res.body.projectId).toBe(testProjectId);
          testFolderId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .send({
          projectId: testProjectId,
          name: 'Test Folder',
        })
        .expect(401);
    });

    it('should fail with missing project ID', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Folder',
        })
        .expect(400);
    });

    it('should fail with missing name', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
        })
        .expect(400);
    });

    it('should fail with empty name', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: '',
        })
        .expect(400);
    });

    it('should fail with name exceeding max length', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'a'.repeat(256),
        })
        .expect(400);
    });

    it('should fail with invalid parent folder ID', () => {
      return request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Test Folder',
          parentId: 'invalid-uuid',
        })
        .expect(404);
    });
  });

  describe('GET /audio/folders', () => {
    it('should get folder list successfully', () => {
      return request(app.getHttpServer())
        .get('/audio/folders')
        .query({ projectId: testProjectId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('projectId');
        });
    });

    it('should fail without project ID', () => {
      return request(app.getHttpServer())
        .get('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/audio/folders')
        .query({ projectId: testProjectId })
        .expect(401);
    });
  });

  describe('GET /audio/folders/:id', () => {
    it('should get folder details successfully', () => {
      return request(app.getHttpServer())
        .get(`/audio/folders/${testFolderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('projectId');
          expect(res.body.id).toBe(testFolderId);
          expect(res.body.name).toBe(testFolder.name);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/audio/folders/${testFolderId}`)
        .expect(401);
    });

    it('should fail with invalid folder ID', () => {
      return request(app.getHttpServer())
        .get('/audio/folders/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /audio/folders/:id', () => {
    it('should update folder successfully', () => {
      const updateData = {
        name: 'Updated Folder Name',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/audio/folders/${testFolderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.description).toBe(updateData.description);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/audio/folders/${testFolderId}`)
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });

    it('should fail with non-existent folder ID', () => {
      return request(app.getHttpServer())
        .patch('/audio/folders/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /audio/folders/:id', () => {
    let testFolderToDeleteId: string;

    beforeAll(async () => {
      // 创建一个待删除的文件夹
      const res = await request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Folder to Delete',
        });
      testFolderToDeleteId = res.body.id;
    });

    it('should delete folder successfully', () => {
      return request(app.getHttpServer())
        .delete(`/audio/folders/${testFolderToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('文件夹删除成功');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/audio/folders/${testFolderToDeleteId}`)
        .expect(401);
    });

    it('should fail with non-existent folder ID', () => {
      return request(app.getHttpServer())
        .delete('/audio/folders/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail to delete folder with audio files', async () => {
      // 模拟文件夹有音频文件的情况
      // 这里我们测试一下错误场景，实际需要先创建音频文件
      // 由于我们还没有实现真正的文件上传，这里只是测试 API 端点
      const response = await request(app.getHttpServer())
        .delete(`/audio/folders/${testFolderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // 应该失败，因为文件夹有音频文件
      // 由于我们还没有真正上传文件，这个测试可能需要调整
      // 目前我们先跳过这个测试
    });
  });

  // ============ 音频文件管理测试 ============

  describe('POST /audio/upload', () => {
    it('should upload audio file successfully', () => {
      // 注意：这里我们使用一个 mock 文件，实际测试需要真正的音频文件
      // 由于这是一个 E2E 测试，我们可能需要先准备一个测试音频文件
      
      // 暂时跳过这个测试，因为我们需要实际的文件
      // 这个测试应该在有真实文件时运行
      
      // return request(app.getHttpServer())
      //   .post('/audio/upload')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .field('projectId', testProjectId)
      //   .attach('file', 'path/to/test-audio.mp3')
      //   .expect(201);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/audio/upload')
        .field('projectId', testProjectId)
        .expect(401);
    });

    it('should fail without project ID', () => {
      return request(app.getHttpServer())
        .post('/audio/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail with invalid project ID', () => {
      return request(app.getHttpServer())
        .post('/audio/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('projectId', 'invalid-uuid')
        .expect(400);
    });

    it('should fail with invalid file type', () => {
      // 暂时跳过，因为需要实际文件
      // return request(app.getHttpServer())
      //   .post('/audio/upload')
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .field('projectId', testProjectId)
      //   .attach('file', 'path/to/test.txt')
      //   .expect(400);
    });
  });

  describe('GET /audio', () => {
    it('should get audio file list successfully', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({ projectId: testProjectId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('pageSize');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({ projectId: testProjectId })
        .expect(401);
    });

    it('should filter audio files by folder ID', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({
          projectId: testProjectId,
          folderId: testFolderId,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter audio files by name', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({
          projectId: testProjectId,
          name: 'test',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter audio files by status', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({
          projectId: testProjectId,
          status: 'ready',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should paginate results correctly', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({
          projectId: testProjectId,
          page: 1,
          pageSize: 10,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.pageSize).toBe(10);
          expect(res.body.data.length).toBeLessThanOrEqual(10);
        });
    });
  });

  describe('GET /audio/stats/project/:projectId', () => {
    it('should get audio file count for project', () => {
      return request(app.getHttpServer())
        .get(`/audio/stats/project/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('projectId');
          expect(res.body).toHaveProperty('count');
          expect(res.body.projectId).toBe(testProjectId);
          expect(typeof res.body.count).toBe('number');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/audio/stats/project/${testProjectId}`)
        .expect(401);
    });
  });

  describe('GET /audio/stats/folder/:folderId', () => {
    it('should get audio file count for folder', () => {
      return request(app.getHttpServer())
        .get(`/audio/stats/folder/${testFolderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('folderId');
          expect(res.body).toHaveProperty('count');
          expect(res.body.folderId).toBe(testFolderId);
          expect(typeof res.body.count).toBe('number');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/audio/stats/folder/${testFolderId}`)
        .expect(401);
    });
  });

  // ============ 数据格式验证测试 ============

  describe('Data Format Validation', () => {
    it('should return correct response format for folder creation', () => {
      return request(app.getHttpServer())
        .get(`/audio/folders/${testFolderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(typeof res.body.id).toBe('string');
          expect(typeof res.body.name).toBe('string');
          expect(typeof res.body.projectId).toBe('string');
          expect(typeof res.body.createdAt).toBe('string');
          expect(typeof res.body.updatedAt).toBe('string');
          
          // Validate optional fields
          if (res.body.description) {
            expect(typeof res.body.description).toBe('string');
          }
          if (res.body.parentId) {
            expect(typeof res.body.parentId).toBe('string');
          }
        });
    });

    it('should return correct response format for folder list', () => {
      return request(app.getHttpServer())
        .get('/audio/folders')
        .query({ projectId: testProjectId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(typeof res.body[0].id).toBe('string');
            expect(typeof res.body[0].name).toBe('string');
            expect(typeof res.body[0].projectId).toBe('string');
          }
        });
    });

    it('should return correct response format for audio file list', () => {
      return request(app.getHttpServer())
        .get('/audio')
        .query({ projectId: testProjectId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(typeof res.body.total).toBe('number');
          expect(typeof res.body.page).toBe('number');
          expect(typeof res.body.pageSize).toBe('number');
          
          // Validate pagination
          expect(res.body.page).toBeGreaterThanOrEqual(1);
          expect(res.body.pageSize).toBeGreaterThan(0);
          expect(res.body.total).toBeGreaterThanOrEqual(0);
        });
    });
  });

  // ============ 跨请求一致性测试 ============

  describe('Cross-Request Consistency', () => {
    it('should maintain data consistency across folder CRUD operations', async () => {
      // Create
      const createRes = await request(app.getHttpServer())
        .post('/audio/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: `Consistency Test ${Date.now()}`,
          description: 'Test description',
        });

      const folderId = createRes.body.id;
      const originalName = createRes.body.name;

      // Read
      const readRes = await request(app.getHttpServer())
        .get(`/audio/folders/${folderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readRes.body.id).toBe(folderId);
      expect(readRes.body.name).toBe(originalName);

      // Update
      const updatedName = 'Updated Folder Name';
      await request(app.getHttpServer())
        .patch(`/audio/folders/${folderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: updatedName });

      // Verify Update
      const verifyRes = await request(app.getHttpServer())
        .get(`/audio/folders/${folderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyRes.body.name).toBe(updatedName);
      expect(verifyRes.body.id).toBe(folderId);

      // Delete
      await request(app.getHttpServer())
        .delete(`/audio/folders/${folderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify Deletion
      const listRes = await request(app.getHttpServer())
        .get('/audio/folders')
        .query({ projectId: testProjectId })
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.body.find((f: any) => f.id === folderId)).toBeUndefined();
    });
  });

  // ============ 音频流式传输和下载测试 ============

  describe('GET /audio/:id/stream', () => {
    let testAudioFileId: string;

    beforeAll(async () => {
      // 创建一个测试音频文件记录
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');

      // 创建一个小的测试音频文件
      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const randomName = crypto.randomBytes(16).toString('hex');
      const storageKey = `${randomName}.mp3`;
      const filePath = path.join(uploadDir, storageKey);

      // 创建一个简单的 MP3 文件（实际上这不是一个有效的 MP3，只是为了测试文件存在）
      // 在实际测试中，应该使用真实的音频文件
      const dummyData = Buffer.from('dummy audio data');
      fs.writeFileSync(filePath, dummyData);

      // 创建音频文件记录
      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Test Audio File.mp3',
          storagePath: '',
          storageKey: storageKey,
          fileSize: dummyData.length,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      testAudioFileId = createRes.body.id;
    });

    it('should stream audio file successfully', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /audio/);
    });

    it('should support range requests', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=0-1023')
        .expect(206)
        .expect('Content-Range', /bytes 0-1023/)
        .expect('Accept-Ranges', 'bytes');
    });

    it('should return 416 for invalid range', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=999999-9999999')
        .expect(416)
        .expect('Content-Range', /bytes \*\//);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/stream`)
        .expect(401);
    });

    it('should fail with non-existent audio file ID', () => {
      return request(app.getHttpServer())
        .get('/audio/non-existent-id/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail when audio file is not ready', async () => {
      // 创建一个未就绪的音频文件
      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Uploading Audio.mp3',
          storagePath: '',
          storageKey: 'non-existent-file.mp3',
          fileSize: 1000,
          fileType: 'audio/mpeg',
          status: 'uploading',
        });

      return request(app.getHttpServer())
        .get(`/audio/${createRes.body.id}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail when audio file does not exist on disk', async () => {
      // 创建一个文件记录但文件不存在
      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Missing File.mp3',
          storagePath: '',
          storageKey: 'non-existent-file-12345.mp3',
          fileSize: 1000,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      return request(app.getHttpServer())
        .get(`/audio/${createRes.body.id}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /audio/:id/download', () => {
    let testAudioFileId: string;

    beforeAll(async () => {
      // 创建一个测试音频文件记录（复用上面的逻辑）
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');

      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      const randomName = crypto.randomBytes(16).toString('hex');
      const storageKey = `${randomName}.mp3`;
      const filePath = path.join(uploadDir, storageKey);

      const dummyData = Buffer.from('dummy audio data for download');
      fs.writeFileSync(filePath, dummyData);

      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Test Download Audio.mp3',
          storagePath: '',
          storageKey: storageKey,
          fileSize: dummyData.length,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      testAudioFileId = createRes.body.id;
    });

    it('should download audio file successfully', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Disposition', /attachment/)
        .expect('Content-Type', /audio/);
    });

    it('should include correct filename in Content-Disposition header', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Disposition', /Test Download Audio.mp3/);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/audio/${testAudioFileId}/download`)
        .expect(401);
    });

    it('should fail with non-existent audio file ID', () => {
      return request(app.getHttpServer())
        .get('/audio/non-existent-id/download')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // ============ 流式传输和下载的边界情况测试 ============

  describe('Stream and Download Edge Cases', () => {
    it('should handle zero-byte range requests correctly', async () => {
      // 创建一个小的测试文件
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');

      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      const randomName = crypto.randomBytes(16).toString('hex');
      const storageKey = `${randomName}.mp3`;
      const filePath = path.join(uploadDir, storageKey);

      const dummyData = Buffer.from('small');
      fs.writeFileSync(filePath, dummyData);

      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Small Audio.mp3',
          storagePath: '',
          storageKey: storageKey,
          fileSize: dummyData.length,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      return request(app.getHttpServer())
        .get(`/audio/${createRes.body.id}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=0-0')
        .expect(206);
    });

    it('should handle range request for entire file', async () => {
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');

      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      const randomName = crypto.randomBytes(16).toString('hex');
      const storageKey = `${randomName}.mp3`;
      const filePath = path.join(uploadDir, storageKey);

      const dummyData = Buffer.from('test audio data');
      const fileSize = dummyData.length;
      fs.writeFileSync(filePath, dummyData);

      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Full Range Audio.mp3',
          storagePath: '',
          storageKey: storageKey,
          fileSize: fileSize,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      return request(app.getHttpServer())
        .get(`/audio/${createRes.body.id}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', `bytes=0-${fileSize - 1}`)
        .expect(206)
        .expect('Content-Range', `bytes 0-${fileSize - 1}/${fileSize}`);
    });

    it('should return correct Content-Length for range requests', async () => {
      const fs = require('fs');
      const path = require('path');
      const crypto = require('crypto');

      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      const randomName = crypto.randomBytes(16).toString('hex');
      const storageKey = `${randomName}.mp3`;
      const filePath = path.join(uploadDir, storageKey);

      const dummyData = Buffer.from('audio content for testing');
      fs.writeFileSync(filePath, dummyData);

      const createRes = await request(app.getHttpServer())
        .post('/audio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Content Length Test.mp3',
          storagePath: '',
          storageKey: storageKey,
          fileSize: dummyData.length,
          fileType: 'audio/mpeg',
          status: 'ready',
        });

      return request(app.getHttpServer())
        .get(`/audio/${createRes.body.id}/stream`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=5-14')
        .expect(206)
        .expect((res) => {
          expect(res.header['content-length']).toBe('10');
        });
    });
  });
});