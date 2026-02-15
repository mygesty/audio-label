import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Projects API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let testTeamId: string;
  let testProjectId: string;
  let secondTestProjectId: string;

  const testUser = {
    email: `projecttest${Date.now()}@example.com`,
    username: `projecttest${Date.now()}`,
    password: 'TestPass123',
  };

  const testTeam = {
    name: `Test Team ${Date.now()}`,
    description: 'Test team for project management',
  };

  const testProject = {
    name: `Test Project ${Date.now()}`,
    description: 'Test project for project management',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a project successfully', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
          name: testProject.name,
          description: testProject.description,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('teamId');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body.name).toBe(testProject.name);
          expect(res.body.teamId).toBe(testTeamId);
          expect(res.body.status).toBe('active');
          testProjectId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .send({
          teamId: testTeamId,
          name: 'Test Project',
        })
        .expect(401);
    });

    it('should fail with invalid team ID', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: 'invalid-uuid',
          name: 'Test Project',
        })
        .expect(400);
    });

    it('should fail with missing team ID', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
        })
        .expect(400);
    });

    it('should fail with missing name', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
        })
        .expect(400);
    });

    it('should fail with empty name', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
          name: '',
        })
        .expect(400);
    });

    it('should fail with name exceeding max length', () => {
      return request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
          name: 'a'.repeat(256),
        })
        .expect(400);
    });
  });

  describe('GET /projects', () => {
    it('should get project list successfully', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('pageSize');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .expect(401);
    });

    it('should filter projects by team ID', () => {
      return request(app.getHttpServer())
        .get(`/projects?teamId=${testTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((p: any) => p.teamId === testTeamId)).toBe(true);
        });
    });

    it('should filter projects by name', () => {
      return request(app.getHttpServer())
        .get(`/projects?name=${testProject.name}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.some((p: any) => p.name.includes(testProject.name))).toBe(true);
        });
    });

    it('should filter projects by status', () => {
      return request(app.getHttpServer())
        .get('/projects?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((p: any) => p.status === 'active')).toBe(true);
        });
    });

    it('should paginate results correctly', () => {
      return request(app.getHttpServer())
        .get('/projects?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.pageSize).toBe(10);
          expect(res.body.data.length).toBeLessThanOrEqual(10);
        });
    });
  });

  describe('GET /projects/:id', () => {
    it('should get project details successfully', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('teamId');
          expect(res.body).toHaveProperty('status');
          expect(res.body.id).toBe(testProjectId);
          expect(res.body.name).toBe(testProject.name);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/projects/${testProjectId}`)
        .expect(401);
    });

    it('should fail with invalid project ID', () => {
      return request(app.getHttpServer())
        .get('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update project successfully', () => {
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.description).toBe(updateData.description);
        });
    });

    it('should update project status', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'archived',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('archived');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${testProjectId}`)
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });

    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });

    it('should fail with non-existent project ID', () => {
      return request(app.getHttpServer())
        .patch('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete project successfully (soft delete)', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('项目删除成功');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/projects/${testProjectId}`)
        .expect(401);
    });

    it('should fail with non-existent project ID', () => {
      return request(app.getHttpServer())
        .delete('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return deleted project in list', () => {
      return request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.find((p: any) => p.id === testProjectId)).toBeUndefined();
        });
    });
  });

  describe('Data Format Validation', () => {
    beforeAll(async () => {
      // Create another project for validation tests
      const res = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
          name: `Validation Test ${Date.now()}`,
        });
      secondTestProjectId = res.body.id;
    });

    it('should return correct response format for project creation', () => {
      return request(app.getHttpServer())
        .get(`/projects/${secondTestProjectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(typeof res.body.id).toBe('string');
          expect(typeof res.body.name).toBe('string');
          expect(typeof res.body.teamId).toBe('string');
          expect(typeof res.body.status).toBe('string');
          expect(typeof res.body.createdAt).toBe('string');
          expect(typeof res.body.updatedAt).toBe('string');
          
          // Validate status enum
          expect(['active', 'archived', 'deleted']).toContain(res.body.status);
          
          // Validate optional fields
          if (res.body.description) {
            expect(typeof res.body.description).toBe('string');
          }
          if (res.body.settings) {
            expect(typeof res.body.settings).toBe('object');
          }
        });
    });

    it('should return correct response format for project list', () => {
      return request(app.getHttpServer())
        .get('/projects')
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

  describe('Project Members API', () => {
    it('should return empty members list for new project', () => {
      return request(app.getHttpServer())
        .get(`/projects/${secondTestProjectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should successfully add a member', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${secondTestProjectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          role: 'member',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('role');
    });

    it('should fail to add duplicate member', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${secondTestProjectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          role: 'member',
        });

      expect(response.status).toBe(400);
    });

    it('should return member list with added member', () => {
      return request(app.getHttpServer())
        .get(`/projects/${secondTestProjectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('userId');
          expect(res.body.data[0]).toHaveProperty('role');
        });
    });

    it('should successfully update member role', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${secondTestProjectId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'admin',
        });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
    });

    it('should successfully remove member', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${secondTestProjectId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail to remove non-existent member', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${secondTestProjectId}/members/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Cross-Request Consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      // Create
      const createRes = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamId: testTeamId,
          name: `Consistency Test ${Date.now()}`,
          description: 'Test description',
        });

      const projectId = createRes.body.id;
      const originalName = createRes.body.name;

      // Read
      const readRes = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readRes.body.id).toBe(projectId);
      expect(readRes.body.name).toBe(originalName);

      // Update
      const updatedName = 'Updated Name';
      await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: updatedName });

      // Verify Update
      const verifyRes = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyRes.body.name).toBe(updatedName);
      expect(verifyRes.body.id).toBe(projectId);

      // Delete
      await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify Deletion
      const listRes = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.body.data.find((p: any) => p.id === projectId)).toBeUndefined();
    });
  });
});