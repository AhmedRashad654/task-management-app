import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator.js';
import { Reflector } from '@nestjs/core';
import { ApiResponse } from '../types/response.interface.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((result) => {
        const isPaginated =
          result &&
          typeof result === 'object' &&
          'items' in result &&
          'meta' in result;

        return {
          success: true,
          ...(message && { message }),
          data: isPaginated ? result.items : result,
          ...(isPaginated && { meta: result.meta }),
        };
      }),
    );
  }
}
