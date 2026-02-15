import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Teams API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let testTeamId: string;
  let secondUserId: string;
  let secondUserToken: string;

  const testUser = {
    email: `teamtest${Date.now()}@example.com`,
    username: `teamtest${Date.now()}`,
    password: 'TestPass123',
  };

  const secondUser = {
    email: `teamtest2${Date.now()}@example.com`,
    username: `teamtest2${Date.now()}`,
    password: 'TestPass123',
  };

  const testTeam = {
    name: `Test Team ${Date.now()}`,
    description: 'Test team for team management',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // 注册并登录第一个用户
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    authToken = registerRes.body.accessToken;
    testUserId = registerRes.body.user.id;

    // 注册并登录第二个用户
    const secondRegisterRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(secondUser);

    secondUserToken = secondRegisterRes.body.accessToken;
    secondUserId = secondRegisterRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /teams', () => {
    it('should create a team successfully', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTeam)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('ownerId');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body.name).toBe(testTeam.name);
          expect(res.body.ownerId).toBe(testUserId);
          testTeamId = res.body.id;
        });
    });

    it('should automatically add creator as admin', async () => {
      const membersRes = await request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(membersRes.status).toBe(200);
      expect(membersRes.body.length).toBe(1);
      expect(membersRes.body[0].userId).toBe(testUserId);
      expect(membersRes.body[0].role).toBe('admin');
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .send(testTeam)
        .expect(401);
    });

    it('should fail with missing name', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test description',
        })
        .expect(400);
    });

    it('should fail with empty name', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
        })
        .expect(400);
    });

    it('should fail with name exceeding max length', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'a'.repeat(256),
        })
        .expect(400);
    });
  });

  describe('GET /teams', () => {
    it('should get team list successfully', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('ownerId');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .expect(401);
    });

    it('should search teams by name', () => {
      return request(app.getHttpServer())
        .get(`/teams?search=${testTeam.name}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.some((t: any) => t.name.includes(testTeam.name))).toBe(true);
        });
    });

    it('should search teams by description', () => {
      return request(app.getHttpServer())
        .get(`/teams?search=${testTeam.description}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.some((t: any) => t.description && t.description.includes(testTeam.description))).toBe(true);
        });
    });

    it('should not return teams for non-member user', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /teams/:id', () => {
    it('should get team details successfully', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('ownerId');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('teamMembers');
          expect(res.body.id).toBe(testTeamId);
          expect(res.body.name).toBe(testTeam.name);
          expect(Array.isArray(res.body.teamMembers)).toBe(true);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}`)
        .expect(401);
    });

    it('should fail with invalid team ID', () => {
      return request(app.getHttpServer())
        .get('/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail for non-member user', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);
    });
  });

  describe('PATCH /teams/:id', () => {
    it('should update team successfully', () => {
      const updateData = {
        name: 'Updated Team Name',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}`)
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
        .patch(`/teams/${testTeamId}`)
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });

    it('should fail for non-admin user', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(403);
    });

    it('should fail with non-existent team ID', () => {
      return request(app.getHttpServer())
        .patch('/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /teams/:id', () => {
    let secondTeamId: string;

    beforeAll(async () => {
      // Create another team for deletion test
      const res = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Delete Test ${Date.now()}`,
        });
      secondTeamId = res.body.id;
    });

    it('should delete team successfully (soft delete)', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${secondTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${secondTeamId}`)
        .expect(401);
    });

    it('should fail for non-owner user', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);
    });

    it('should not return deleted team in list', () => {
      return request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.find((t: any) => t.id === secondTeamId)).toBeUndefined();
        });
    });
  });

  describe('POST /teams/:id/invite', () => {
    it('should invite members successfully', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: [secondUser.email],
          role: 'member',
        })
        .expect(201)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('userId');
          expect(res.body[0]).toHaveProperty('role');
          expect(res.body[0].userId).toBe(secondUserId);
          expect(res.body[0].role).toBe('member');
        });
    });

    it('should invite multiple members', async () => {
      // Create a third user
      const thirdUser = {
        email: `teamtest3${Date.now()}@example.com`,
        username: `teamtest3${Date.now()}`,
        password: 'TestPass123',
      };

      const thirdUserRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(thirdUser);

      const response = await request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: [thirdUserRes.body.user.email],
          role: 'admin',
        });

      expect(response.status).toBe(201);
      expect(response.body[0].role).toBe('admin');
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .send({
          emails: [secondUser.email],
          role: 'member',
        })
        .expect(401);
    });

    it('should fail for non-admin user', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          emails: [secondUser.email],
          role: 'member',
        })
        .expect(403);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: ['nonexistent@example.com'],
          role: 'member',
        })
        .expect(404);
    });

    it('should fail with duplicate member', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: [secondUser.email],
          role: 'member',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: ['invalid-email'],
          role: 'member',
        })
        .expect(400);
    });
  });

  describe('GET /teams/:id/members', () => {
    it('should get team members list successfully', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('userId');
          expect(res.body[0]).toHaveProperty('role');
          expect(res.body[0]).toHaveProperty('joinedAt');
          expect(res.body[0]).toHaveProperty('user');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .expect(401);
    });

    it('should fail for non-member user', async () => {
      // Create a non-member user
      const nonMemberUser = {
        email: `nonmember${Date.now()}@example.com`,
        username: `nonmember${Date.now()}`,
        password: 'TestPass123',
      };

      const nonMemberRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(nonMemberUser);

      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .set('Authorization', `Bearer ${nonMemberRes.body.accessToken}`)
        .expect(403);
    });

    it('should return members sorted by join time', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const members = res.body;
          for (let i = 1; i < members.length; i++) {
            expect(new Date(members[i].joinedAt) >= new Date(members[i - 1].joinedAt)).toBe(true);
          }
        });
    });
  });

  describe('DELETE /teams/:id/members/:userId', () => {
    it('should remove member successfully', async () => {
      // First invite a new member to remove
      const newUser = {
        email: `removetest${Date.now()}@example.com`,
        username: `removetest${Date.now()}`,
        password: 'TestPass123',
      };

      const newUserRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser);

      await request(app.getHttpServer())
        .post(`/teams/${testTeamId}/invite`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emails: [newUserRes.body.user.email],
          role: 'member',
        });

      // Remove the member
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}/members/${newUserRes.body.user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}/members/${secondUserId}`)
        .expect(401);
    });

    it('should fail for non-admin user', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}/members/${secondUserId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403);
    });

    it('should fail to remove team owner', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}/members/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should fail with non-existent member', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${testTeamId}/members/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /teams/:id/members/:userId/role', () => {
    it('should update member role successfully', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/${secondUserId}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'admin',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.role).toBe('admin');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/${secondUserId}/role`)
        .send({
          role: 'admin',
        })
        .expect(401);
    });

    it('should fail for non-admin user', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/${secondUserId}/role`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          role: 'admin',
        })
        .expect(403);
    });

    it('should fail to update team owner role', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/${testUserId}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'member',
        })
        .expect(403);
    });

    it('should fail with invalid role', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/${secondUserId}/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'invalid-role',
        })
        .expect(400);
    });

    it('should fail with non-existent member', () => {
      return request(app.getHttpServer())
        .patch(`/teams/${testTeamId}/members/non-existent-id/role`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'admin',
        })
        .expect(404);
    });
  });

  describe('Data Format Validation', () => {
    it('should return correct response format for team creation', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(typeof res.body.id).toBe('string');
          expect(typeof res.body.name).toBe('string');
          expect(typeof res.body.ownerId).toBe('string');
          expect(typeof res.body.createdAt).toBe('string');
          expect(typeof res.body.updatedAt).toBe('string');
          
          // Validate optional fields
          if (res.body.description) {
            expect(typeof res.body.description).toBe('string');
          }
          if (res.body.settings) {
            expect(typeof res.body.settings).toBe('object');
          }
        });
    });

    it('should return correct response format for team members', () => {
      return request(app.getHttpServer())
        .get(`/teams/${testTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          // Validate response structure
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            const member = res.body[0];
            expect(typeof member.id).toBe('string');
            expect(typeof member.userId).toBe('string');
            expect(typeof member.role).toBe('string');
            expect(typeof member.joinedAt).toBe('string');
            
            // Validate role enum
            expect(['member', 'admin']).toContain(member.role);
            
            // Validate user object
            if (member.user) {
              expect(typeof member.user.id).toBe('string');
              expect(typeof member.user.email).toBe('string');
              expect(typeof member.user.username).toBe('string');
            }
          }
        });
    });
  });

  describe('Cross-Request Consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      // Create
      const createRes = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Consistency Test ${Date.now()}`,
          description: 'Test description',
        });

      const teamId = createRes.body.id;
      const originalName = createRes.body.name;

      // Read
      const readRes = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readRes.body.id).toBe(teamId);
      expect(readRes.body.name).toBe(originalName);

      // Update
      const updatedName = 'Updated Name';
      await request(app.getHttpServer())
        .patch(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: updatedName });

      // Verify Update
      const verifyRes = await request(app.getHttpServer())
        .get(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyRes.body.name).toBe(updatedName);
      expect(verifyRes.body.id).toBe(teamId);

      // Delete
      await request(app.getHttpServer())
        .delete(`/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify Deletion
      const listRes = await request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listRes.body.find((t: any) => t.id === teamId)).toBeUndefined();
    });
  });
});