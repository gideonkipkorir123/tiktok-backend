import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { User } from "../user/entities/user.entity";
import { RegisterDto } from "src/auth/dto/Register.dto";
import { AuthService } from "src/auth/auth.service";
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.js";
import { Response, Request } from "express";

import { createWriteStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
// import * as FileUpload from 'graphql-upload/graphqlUploadExpress.js';
import { BadRequestException } from "@nestjs/common";
import {
  LoginResponse,
  RegisterResponse,
} from "src/auth/dto/Register.Response.dto";
import { LoginDto } from "src/auth/dto/Login.dto";
import { PrismaService } from "src/prisma/prisma.service";
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [User], { name: "users" })
  getUsers() {
    return this.prisma.user.findMany({});
  }

  @Query(() => User, { name: "user" })
  getUser(@Args("id") id: string) {
    return this.userService.findSingleUser(id);
  }

  @Mutation(() => RegisterResponse)
  async register(
    @Args("registerInput") registerDto: RegisterDto,
    @Context() context: { res: Response },
  ): Promise<RegisterResponse> {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: "Password and confirm password are not the same.",
      });
    }
    try {
      const { user } = await this.authService.registerUser(
        registerDto,
        context.res,
      );
      console.log("user!", user);
      return { user };
    } catch (error) {
      // Handle the error, for instance if it's a validation error or some other type
      return {
        error: {
          message: error.message,
          // code: 'SOME_ERROR_CODE' // If you have error codes
        },
      };
    }
  }
  @Mutation(() => LoginResponse)
  async login(
    @Args("login") loginDto: LoginDto,
    @Context() context: { res: Response },
  ) {
    return this.authService.Login(loginDto, context.res);
  }
  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    return this.authService.logout(context.res);
  }
  @Mutation(() => User)
  async updateUserProfile(
    @Context()
    context: { req: Request },
    @Args("fullname", { type: () => String, nullable: true }) fullname?: string,
    @Args("bio", { type: () => String, nullable: true }) bio?: string,
    @Args("image", { type: () => GraphQLUpload, nullable: true })
    image?: GraphQLUpload,
  ) {
    console.log("image!", image, "fullname!", fullname, "bio!", bio);
    let imageUrl;
    if (image) {
      imageUrl = await this.storeImageAndGetURL(image);
    }
    return this.userService.updateProfile(context.req.user.sub, {
      fullname,
      bio,
      image: imageUrl,
    });
  }
  private async storeImageAndGetURL(file: GraphQLUpload): Promise<string> {
    const { createReadStream, filename } = await file;
    const fileData = await file;
    console.log("fileData!", fileData);

    const uniqueFilename = `${uuidv4()}_${filename}`;
    const imagePath = join(process.cwd(), "public", uniqueFilename);
    const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
    const readStream = createReadStream();
    readStream.pipe(createWriteStream(imagePath));

    return imageUrl; // Return the appropriate URL where the file can be accessed
  }
  @Mutation(() => String)
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    try {
      return this.authService.refreshToken(context.req, context.res);
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
