import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectMemberService } from './project-member.service.js';
import { ProjectOwnerGuard } from './project-owner.guard.js';
import { ProjectMemberGuard } from './project-member.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectMemberService, ProjectOwnerGuard, ProjectMemberGuard],
})
export class ProjectsModule {}
