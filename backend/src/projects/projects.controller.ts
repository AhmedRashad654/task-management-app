import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectOwnerGuard } from './project-owner.guard.js';
import { ProjectMemberGuard } from './project-member.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.interface.js';
import { ProjectsService } from './projects.service.js';
import { ProjectMemberService } from './project-member.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { PROJECT_MESSAGES } from '../common/constants/messages.constant.js';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectMemberService: ProjectMemberService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ResponseMessage(PROJECT_MESSAGES.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Update a project (owner only)' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ResponseMessage(PROJECT_MESSAGES.UPDATED)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Delete a project (owner only)' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ResponseMessage(PROJECT_MESSAGES.DELETED)
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Get(':id/members')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'Get project members with owner' })
  @ApiResponse({ status: 200, description: 'Project owner and members' })
  findMembers(@Param('id') id: string) {
    return this.projectMemberService.findMembers(id);
  }

  @Post(':id/members')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Add a member to project (owner only)' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ResponseMessage(PROJECT_MESSAGES.MEMBER_ADDED)
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projectMemberService.addMember(id, dto);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Remove a member from project (owner only)' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Project or member not found' })
  @ResponseMessage(PROJECT_MESSAGES.MEMBER_REMOVED)
  removeMember(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberId') memberId: string,
  ) {
    return this.projectMemberService.removeMember(id, user.id, memberId);
  }
}
