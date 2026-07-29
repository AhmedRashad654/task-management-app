import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../common/types/authenticated-user.interface.js';
import { Logger } from '@nestjs/common';

interface StatusChangePayload {
  taskId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: Date;
}

@WebSocketGateway({
  path: '/ws',
  cors: { origin: true, credentials: true },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TasksGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token: string = socket.handshake.auth?.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload: JwtPayload = this.jwtService.verify(token);

      const projects = await this.prisma.project.findMany({
        where: {
          OR: [
            { ownerId: payload.id },
            { members: { some: { userId: payload.id } } },
          ],
        },
        select: { id: true },
      });

      const projectIds = projects.map((p) => p.id);
      socket.data.userId = payload.id;
      socket.data.allowedProjects = new Set(projectIds);

      socket.emit('hello', { allowedProjects: projectIds });
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`User ${socket.data.userId} disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    socket: Socket,
    projectId: string,
  ): { ok: boolean; error?: string } {
    const allowed: Set<string> = socket.data.allowedProjects;
    if (!allowed || !allowed.has(projectId)) {
      return { ok: false, error: 'not permitted' };
    }

    void socket.join(`project:${projectId}`);
    return { ok: true };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(socket: Socket, projectId: string): void {
    void socket.leave(`project:${projectId}`);
  }

  emitTaskStatusChanged(projectId: string, payload: StatusChangePayload) {
    this.server.to(`project:${projectId}`).emit('task.status.changed', payload);
  }
}
