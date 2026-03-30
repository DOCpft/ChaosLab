import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        console.log('CurrentUser Decorator - Request User:', request.user); // Логирование для отладки
        return request.user;
    },
);