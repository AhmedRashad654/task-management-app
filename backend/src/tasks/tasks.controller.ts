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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../projects/project-member.guard.js';
import { TaskAccessGuard } from './task-access.guard.js';
import { TaskAction } from './decorators/task-action.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { QueryTasksDto } from './dto/query-tasks.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { TASK_MESSAGES } from '../common/constants/messages.constant.js';

@ApiTags('Tasks')
@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task in a project' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ResponseMessage(TASK_MESSAGES.CREATED)
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks in a project with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of tasks' })
  findAll(
    @Param('projectId') projectId: string,
    @Query() query: QueryTasksDto,
  ) {
    return this.tasksService.findAll(projectId, query);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get a single task' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(projectId, taskId);
  }

  @Patch(':taskId')
  @UseGuards(TaskAccessGuard)
  @TaskAction('update')
  @ApiOperation({ summary: 'Update a task (owner or creator only)' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ResponseMessage(TASK_MESSAGES.UPDATED)
  update(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(taskId, dto);
  }

  @Patch(':taskId/status')
  @UseGuards(TaskAccessGuard)
  @TaskAction('update_status')
  @ApiOperation({ summary: 'Update task status (owner, creator, or assignee)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ResponseMessage(TASK_MESSAGES.CHANGED_STATUES)
  updateStatus(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.tasksService.updateStatus(projectId, taskId, user.id, dto);
  }

  @Delete(':taskId')
  @UseGuards(TaskAccessGuard)
  @TaskAction('delete')
  @ApiOperation({ summary: 'Delete a task (owner or creator only)' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ResponseMessage(TASK_MESSAGES.DELETED)
  delete(@Param('taskId') taskId: string) {
    return this.tasksService.delete(taskId);
  }
}
