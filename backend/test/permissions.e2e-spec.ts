import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Team } from '../src/teams/entities/team.entity';
import { TeamMember } from '../src/teams/entities/team-member.entity';
import { Project } from '../src/projects/entities/project.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserRole, UserStatus } from '../src/users/entities/user.entity';
import { TeamMemberRole } from '../src/teams/entities/team-member.entity';

describe('权限管理模块 E2E 测试 (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
  let teamMemberRepository: Repository<TeamMember>;
  let projectRepository: Repository<Project>;
  let jwtService: JwtService;

  // 测试用户
  let systemAdmin: User;
  let projectAdmin: User;
  let reviewer: User;
  let annotator: User;

  // 测试团队
  let testTeam: Team;

  // 测试项目
  let testProject: Project;

  // JWT tokens
  let systemAdminToken: string;
  let projectAdminToken: string;
  let reviewerToken: string;
  let annotatorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    teamRepository = moduleFixture.get<Repository<Team>>(getRepositoryToken(Team));
    teamMemberRepository = moduleFixture.get<Repository<TeamMember>>(
      getRepositoryToken(TeamMember),
    );
    projectRepository = moduleFixture.get<Repository<Project>>(getRepositoryToken(Project));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // 清理测试数据
    await cleanupTestData();

    // 创建测试用户
    await createTestUsers();

    // 创建测试团队
    await createTestTeam();

    // 创建测试项目
    await createTestProject();

    // 生成 JWT tokens
    systemAdminToken = generateToken(systemAdmin);
    projectAdminToken = generateToken(projectAdmin);
    reviewerToken = generateToken(reviewer);
    annotatorToken = generateToken(annotator);
  });

  afterAll(async () => {
    // 清理测试数据
    await cleanupTestData();
    await app.close();
  });

  describe('权限检查 API', () => {
    describe('POST /auth/permissions/check', () => {
      it('系统管理员应该拥有所有权限', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .set('Authorization', `Bearer ${systemAdminToken}`)
          .send({
            resourceType: 'project',
            resourceId: testProject.id,
            action: 'delete',
          })
          .expect(200);

        expect(response.body).toHaveProperty('allowed', true);
      });

      it('项目管理员应该拥有项目所有权限', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .set('Authorization', `Bearer ${projectAdminToken}`)
          .send({
            resourceType: 'project',
            resourceId: testProject.id,
            action: 'delete',
          })
          .expect(200);

        expect(response.body).toHaveProperty('allowed', true);
      });

      it('审核员不能删除项目', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .set('Authorization', `Bearer ${reviewerToken}`)
          .send({
            resourceType: 'project',
            resourceId: testProject.id,
            action: 'delete',
          })
          .expect(200);

        expect(response.body).toHaveProperty('allowed', false);
        expect(response.body).toHaveProperty('reason');
      });

      it('标注员不能删除项目', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .set('Authorization', `Bearer ${annotatorToken}`)
          .send({
            resourceType: 'project',
            resourceId: testProject.id,
            action: 'delete',
          })
          .expect(200);

        expect(response.body).toHaveProperty('allowed', false);
        expect(response.body).toHaveProperty('reason');
      });

      it('未登录用户无法检查权限', async () => {
        await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .send({
            resourceType: 'project',
            resourceId: testProject.id,
            action: 'read',
          })
          .expect(401);
      });

      it('缺少必需参数时应该返回错误', async () => {
        await request(app.getHttpServer())
          .post('/auth/permissions/check')
          .set('Authorization', `Bearer ${annotatorToken}`)
          .send({
            resourceType: 'project',
            // 缺少 resourceId
            action: 'read',
          })
          .expect(400);
      });
    });

    describe('POST /auth/permissions/batch-check', () => {
      it('应该支持批量权限检查', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/permissions/batch-check')
          .set('Authorization', `Bearer ${annotatorToken}`)
          .send({
            permissions: [
              {
                resourceType: 'project',
                resourceId: testProject.id,
                action: 'read',
              },
              {
                resourceType: 'project',
                resourceId: testProject.id,
                action: 'delete',
              },
            ],
          })
          .expect(200);

        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toHaveLength(2);
        expect(response.body.results[0]).toHaveProperty('allowed', true);
        expect(response.body.results[1]).toHaveProperty('allowed', false);
      });
    });

    describe('GET /auth/permissions/user', () => {
      it('应该返回当前用户的权限信息', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/permissions/user')
          .set('Authorization', `Bearer ${annotatorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('role', UserRole.ANNOTATOR);
        expect(response.body).toHaveProperty('allowedResources');
        expect(response.body).toHaveProperty('allowedActions');
      });

      it('未登录用户无法获取权限信息', async () => {
        await request(app.getHttpServer())
          .get('/auth/permissions/user')
          .expect(401);
      });
    });

    describe('GET /auth/permissions/roles', () => {
      it('系统管理员可以查看所有角色权限', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/permissions/roles')
          .set('Authorization', `Bearer ${systemAdminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('role');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('features');
      });

      it('非系统管理员无法查看角色权限', async () => {
        await request(app.getHttpServer())
          .get('/auth/permissions/roles')
          .set('Authorization', `Bearer ${annotatorToken}`)
          .expect(403);
      });
    });
  });

  describe('角色守卫测试', () => {
    it('标注员访问仅管理员接口应该被拒绝', async () => {
      await request(app.getHttpServer())
        .get('/auth/permissions/roles')
        .set('Authorization', `Bearer ${annotatorToken}`)
        .expect(403);
    });

    it('系统管理员访问所有接口应该成功', async () => {
      await request(app.getHttpServer())
        .get('/auth/permissions/roles')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);
    });
  });

  // 辅助函数
  async function cleanupTestData() {
    await teamMemberRepository.delete({});
    await projectRepository.delete({});
    await teamRepository.delete({});
    await userRepository.delete({});
  }

  async function createTestUsers() {
    systemAdmin = await userRepository.save({
      email: 'system.admin@test.com',
      username: 'system_admin',
      passwordHash: 'hashed_password',
      role: UserRole.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE,
    });

    projectAdmin = await userRepository.save({
      email: 'project.admin@test.com',
      username: 'project_admin',
      passwordHash: 'hashed_password',
      role: UserRole.PROJECT_ADMIN,
      status: UserStatus.ACTIVE,
    });

    reviewer = await userRepository.save({
      email: 'reviewer@test.com',
      username: 'reviewer',
      passwordHash: 'hashed_password',
      role: UserRole.REVIEWER,
      status: UserStatus.ACTIVE,
    });

    annotator = await userRepository.save({
      email: 'annotator@test.com',
      username: 'annotator',
      passwordHash: 'hashed_password',
      role: UserRole.ANNOTATOR,
      status: UserStatus.ACTIVE,
    });
  }

  async function createTestTeam() {
    testTeam = await teamRepository.save({
      name: '测试团队',
      description: '用于权限测试的团队',
    });

    // 添加团队成员
    await teamMemberRepository.save([
      {
        teamId: testTeam.id,
        userId: projectAdmin.id,
        role: TeamMemberRole.ADMIN,
      },
      {
        teamId: testTeam.id,
        userId: reviewer.id,
        role: TeamMemberRole.MEMBER,
      },
      {
        teamId: testTeam.id,
        userId: annotator.id,
        role: TeamMemberRole.MEMBER,
      },
    ]);
  }

  async function createTestProject() {
    testProject = await projectRepository.save({
      name: '测试项目',
      description: '用于权限测试的项目',
      teamId: testTeam.id,
    });
  }

  function generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return jwtService.sign(payload);
  }
});