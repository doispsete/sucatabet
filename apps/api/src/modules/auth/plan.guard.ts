import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPlan } from '@prisma/client';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlans = this.reflector.getAllAndOverride<UserPlan[]>('plans', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Admin bypass
    if (user.role === 'ADMIN') return true;

    if (!user || !requiredPlans.includes(user.plan)) {
      throw new ForbiddenException('Seu plano atual não permite acesso a esta funcionalidade. Faça um upgrade para o plano Básico ou Pro.');
    }

    return true;
  }
}
