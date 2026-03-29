"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : { message: 'Internal Server Error' };
        const isInternalError = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: isInternalError
                ? 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.'
                : (typeof message === 'object' && message.message ? message.message : message),
        };
        if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            console.error('INTERNAL_SERVER_ERROR:', exception);
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'error.log');
                const logEntry = `[${new Date().toISOString()}] ${request.method} ${request.url}\n${exception instanceof Error ? exception.stack : JSON.stringify(exception)}\n\n`;
                fs.appendFileSync(logPath, logEntry);
            }
            catch (e) {
                console.error('Failed to write to error.log', e);
            }
        }
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
