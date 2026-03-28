import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error' };

    const isInternalError = status === HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isInternalError 
        ? 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.' 
        : (typeof message === 'object' && (message as any).message ? (message as any).message : message),
    };

    // Log internal errors but don't expose stack on production
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('INTERNAL_SERVER_ERROR:', exception);
      
      try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'error.log');
        const logEntry = `[${new Date().toISOString()}] ${request.method} ${request.url}\n${exception instanceof Error ? exception.stack : JSON.stringify(exception)}\n\n`;
        fs.appendFileSync(logPath, logEntry);
      } catch (e) {
        console.error('Failed to write to error.log', e);
      }
    }

    response.status(status).json(errorResponse);
  }
}
