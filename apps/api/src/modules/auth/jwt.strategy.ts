import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be defined in environment variables');
    }

    super({
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['access_token'];
        }
        return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!user) {
      throw new UnauthorizedException('Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
    }

    return { userId: user.id, email: user.email, role: user.role, name: user.name };
  }
}
