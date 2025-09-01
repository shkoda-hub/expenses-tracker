import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signIn.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../shared/interfaces/jwt-payload.interface';
import {
  AccessTokenDto,
  AuthTokensDto,
  RefreshTokenDto,
} from './dto/auth-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async login(signInDto: SignInDto): Promise<AuthTokensDto> {
    const { email, password } = signInDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const payload = { sub: user._id, username: user.userName };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'ACCESS_TOKEN_EXPIRATION_TIME',
        ),
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'REFRESH_TOKEN_EXPIRATION_TIME',
        ),
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AccessTokenDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      const user = await this.usersService.findById(payload.sub);

      return {
        accessToken: await this.jwtService.signAsync(
          { sub: payload.sub, username: user.userName },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>(
              'ACCESS_TOKEN_EXPIRATION_TIME',
            ),
          },
        ),
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
