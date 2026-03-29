"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3005',
            'http://localhost:3006',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3005',
            'http://127.0.0.1:3006',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'Origin'],
    });
    app.use((0, cookie_parser_1.default)());
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            reportOnly: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3006"],
            },
        },
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 400,
        exceptionFactory: (errors) => {
            const formattedErrors = errors.map((err) => {
                const constraints = err.constraints || {};
                const messages = Object.values(constraints).map((msg) => {
                    return msg
                        .replace('should not exist', 'não deve existir')
                        .replace('must be a number', 'deve ser um número')
                        .replace('must be a string', 'deve ser uma string')
                        .replace('must be a valid ISO 8601 date string', 'deve ser uma data válida (ISO 8601)')
                        .replace('must be a UUID', 'deve ser um UUID válido')
                        .replace('should not be empty', 'não deve estar vazio')
                        .replace('must be an email', 'deve ser um e-mail válido')
                        .replace('must be longer than or equal to', 'deve ter no mínimo')
                        .replace('must be shorter than or equal to', 'deve ter no máximo')
                        .replace('characters', 'caracteres')
                        .replace('property ', 'A propriedade ');
                });
                return {
                    field: err.property,
                    errors: messages,
                };
            });
            return new (require('@nestjs/common').BadRequestException)(formattedErrors);
        },
    }));
    const port = process.env.PORT || 3006;
    await app.listen(port, '0.0.0.0');
    console.log(`Backend rodando em http://localhost:${port}`);
}
bootstrap();
