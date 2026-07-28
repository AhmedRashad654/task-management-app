import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ResponseData } from '../types/response.interface.js';



@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T | ResponseData<T>,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ResponseData<T>>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((value) => {
        if (
          value &&
          typeof value === 'object' &&
          ('data' in value || 'message' in value || 'meta' in value)
        ) {
          return {
            success: true,
            ...value,
          };
        }

        return {
          success: true,
          data: value as T,
        };
      }),
    );
  }
}
