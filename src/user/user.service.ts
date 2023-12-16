import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async updateProfile(
    userId: string,
    data: { fullname?: string; bio?: string; image?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullname: data.fullname,
        bio: data.bio,
        image: data.image,
      },
    });
  }
  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        posts: true,
      },
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
