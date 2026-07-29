import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TasksGateway } from './tasks.gateway.js';
import { TaskAccessGuard } from './task-access.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TasksGateway, TaskAccessGuard],
})
export class TasksModule {}
