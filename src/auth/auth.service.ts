import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { Request, Response } from "express";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/Login.dto";
import { RegisterDto } from "./dto/Register.dto";
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  // create(createAuthInput: CreateAuthInput) {
  //   return 'This action adds a new auth';
  // }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthInput: UpdateAuthInput) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  // WE CREATE A NEW PROJECT TO TAKE IN REFRESHTOKENS FROM COOKIES
  async refreshToken(req: Request, res: Response): Promise<string> {
    const refreshedTokens = req.cookies["refresh_token"];
    if (!refreshedTokens) {
      throw new UnauthorizedException("NOT AUTHORIZED");
    }
    let payload;
    try {
      payload = this.jwtService.verify(refreshedTokens, {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid or Tokens Expired");
    }
    const userExists = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!userExists) {
      throw new BadRequestException("USER DOESN'T EXIST");
    }
    const expiresIn = 15000;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration },
      {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      },
    );
    res.cookie("access_token", accessToken, { httpOnly: true });
    return accessToken;
  }
  private async issueToken(user: User, res: Response) {
    const payload = { username: user.fullname, sub: user.id };
    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get("ACCESS_TOKEN_SECRET"),
        expiresIn: "1500sec",
      },
    );
    const refreshToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
        expiresIn: "7d",
      },
    );
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("access_token", refreshToken, { httpOnly: true });
    return { user, res };
  }
  async validateUser(login: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: login.email,
      },
    });
    if (!user) {
      throw new ForbiddenException(
        "Access Denied since the user doesn't exist",
      );
    }
    const passwordMatch = await argon2.verify(user.password, login.password);
    if (!passwordMatch) {
      throw new ForbiddenException(
        "Access Denied because the passwords don't match!",
      );
    }
    if (user) {
      return { user };
    }
    return null;
  }
  async registerUser(register: RegisterDto, res: Response) {
    const ExistingUser = await this.prisma.user.findUnique({
      where: {
        email: register.email,
      },
    });
    if (ExistingUser) {
      throw new BadRequestException({
        email: "Email already exists ",
      });
    }
    const hashedPassword = await argon2.hash(register.password);

    const user = await this.prisma.user.create({
      data: {
        email: register.email,
        password: hashedPassword,
        fullname: register.fullname,
      },
    });
    // console.log(this.issueToken(user, res));
    return this.issueToken(user, res);
  }
  async Login(login: LoginDto, res: Response) {
    const user = this.validateUser(login);
    if (!user) {
      throw new BadRequestException({
        message: "please enter correct details",
        invalidCredentials: "credentials dont match",
      });
    }
    return this.issueToken((await user).user, res);
  }
  async logout(res: Response) {
    res.clearCookie("access_cookies");
    res.clearCookie("refresh_cookies");
    return "successfly logged out";
  }
}
