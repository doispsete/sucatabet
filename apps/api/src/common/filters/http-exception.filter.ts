import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

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

    // Captura no Sentry/GlitchTip apenas erros 500 e acima (Safe wrap V14)
    if (isInternalError) {
      try {
        Sentry.captureException(exception);
      } catch (sentryError) {
        console.error('[SENTRY_ERROR] Falha ao enviar erro para o monitor:', sentryError);
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isInternalError
        ? 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.'
        : (typeof message === 'object' && (message as any).message ? (message as any).message : message),
    };

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