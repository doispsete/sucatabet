import { SetMetadata } from '@nestjs/common';
import { UserPlan } from '@prisma/client';

export const PLANS_KEY = 'plans';
export const Plans = (...plans: UserPlan[]) => SetMetadata(PLANS_KEY, plans);
