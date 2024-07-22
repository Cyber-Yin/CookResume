import dayjs from "dayjs";
import { sha256 } from "js-sha256";

import { RedisKeyGenerator } from "../const/redis-key";
import {
  ResumeContent,
  ResumeEntity,
  ResumeGetResponse,
} from "../types/resume";
import { UserEntity } from "../types/user";
import {
  generateRandomSalt,
  varifyEmail,
  varifyInt,
  verifyPassword,
} from "../utils";
import DatabaseInstance from "./prisma.server";
import RedisInstance from "./redis.server";
import { getUserSession } from "./session.server";

export class UserService {
  user: UserEntity | null;
  resumes: ResumeEntity[];

  constructor() {
    this.user = null;
    this.resumes = [];
  }

  async getUserByID(id: number | string): Promise<void> {
    if (typeof id === "string") {
      id = parseInt(id);
    }

    try {
      varifyInt.parse(id);
    } catch (error) {
      throw new Error("无效的用户 ID");
    }

    const user = await DatabaseInstance.user.findUnique({
      select: {
        user_name: true,
        email: true,
        avatar: true,
        banned: true,
      },
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    if (user.banned === 1) {
      throw new Error("用户已被封禁");
    }

    this.user = {
      id,
      name: user.user_name,
      email: user.email,
      avatar: user.avatar || "",
      banned: user.banned === 1,
    };
  }

  async getUserIDByCookie(req: Request): Promise<number | null> {
    const session = await getUserSession(req);

    const userID = session.get("userID") as number;
    const token = session.get("token");

    if (!userID || !token) {
      return null;
    }

    const salt = await RedisInstance.get(
      RedisKeyGenerator.generateUserToken(userID),
    );

    if (salt !== token) {
      return null;
    }

    return userID;
  }

  async autoSignInByCookie(req: Request): Promise<void> {
    const session = await getUserSession(req);

    const userID = session.get("userID") as number;
    const token = session.get("token");

    if (!userID || !token) {
      throw new Error("无效的 Cookie");
    }

    const salt = await RedisInstance.get(
      RedisKeyGenerator.generateUserToken(userID),
    );

    if (salt !== token) {
      throw new Error("无效的 Cookie");
    }

    await this.getUserByID(userID);
  }

  async getUserByEmail(email: string): Promise<void> {
    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
        user_name: true,
        email: true,
        avatar: true,
        banned: true,
      },
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    this.user = {
      id: user.id,
      name: user.user_name,
      email: user.email,
      avatar: user.avatar || "",
      banned: user.banned === 1,
    };
  }

  async checkUserIsRegister(payload: {
    email?: string;
    name?: string;
    both?: boolean;
  }): Promise<boolean> {
    if (!payload.both) {
      if (!payload.email && !payload.name) {
        throw new Error("邮箱或用户名不能为空");
      }

      const whereCondition = payload.email
        ? { email: payload.email }
        : { user_name: payload.name };

      const user = await DatabaseInstance.user.findUnique({
        select: {
          id: true,
        },
        where: whereCondition,
      });

      return Boolean(user);
    } else {
      if (!payload.email || !payload.name) {
        throw new Error("邮箱和用户名均不能为空");
      }

      const user = await DatabaseInstance.user.findFirst({
        select: {
          id: true,
        },
        where: {
          OR: [
            {
              user_name: payload.name,
            },
            {
              email: payload.email,
            },
          ],
        },
      });

      return Boolean(user);
    }
  }

  async logout(req: Request): Promise<void> {
    const userID = await this.getUserIDByCookie(req);

    if (!userID) {
      throw new Error("用户未登录");
    }

    await RedisInstance.del(RedisKeyGenerator.generateUserToken(userID));
  }

  async getUserPassword(payload: {
    account: string;
    isEmail: boolean;
  }): Promise<{
    userID: number;
    password: string;
    salt: string;
  }> {
    const whereCondition = payload.isEmail
      ? { email: payload.account }
      : { user_name: payload.account };

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
        password: true,
        salt: true,
      },
      where: whereCondition,
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    return {
      userID: user.id,
      password: user.password,
      salt: user.salt,
    };
  }

  async signIn(payload: { account: string; password: string }): Promise<{
    userID: number;
    token: string;
  }> {
    let accountIsEmail = false;

    try {
      varifyEmail.parse(payload.account);
      accountIsEmail = true;
    } catch (e) {}

    const user = await this.getUserPassword({
      account: payload.account,
      isEmail: accountIsEmail,
    });

    if (!verifyPassword(user.password, user.salt, payload.password)) {
      throw new Error("密码错误");
    }

    const token = generateRandomSalt();

    await RedisInstance.set(
      RedisKeyGenerator.generateUserToken(user.userID),
      token,
      "EX",
      60 * 60 * 24 * 7,
    );

    return {
      userID: user.userID,
      token,
    };
  }

  async signUp(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    const salt = generateRandomSalt();

    await DatabaseInstance.user.create({
      data: {
        user_name: payload.name,
        email: payload.email,
        password: sha256(payload.password + salt),
        salt,
        banned: 0,
        registered_at: dayjs().unix(),
      },
    });
  }

  async updateUserInfo(payload: {
    name?: string;
    email?: string;
    avatar?: string;
    banned?: boolean;
  }): Promise<void> {
    if (!this.user) {
      throw new Error("用户不存在");
    }

    this.user = {
      ...this.user,
      name: payload.name || this.user.name,
      email: payload.email || this.user.email,
      avatar: payload.avatar || this.user.avatar,
      banned: payload.banned || this.user.banned,
    };

    await DatabaseInstance.user.update({
      where: {
        id: this.user.id,
      },
      data: {
        user_name: this.user.name,
        email: this.user.email,
        avatar: this.user.avatar,
        banned: this.user.banned ? 1 : 0,
      },
    });
  }

  async resetUserPassword(payload: {
    email: string;
    password: string;
  }): Promise<void> {
    await this.getUserByEmail(payload.email);

    const passwordSalt = generateRandomSalt();

    await DatabaseInstance.user.update({
      where: {
        id: this.user!.id,
      },
      data: {
        password: sha256(payload.password + passwordSalt),
        salt: passwordSalt,
      },
    });

    await RedisInstance.del(RedisKeyGenerator.generateUserToken(this.user!.id));
  }

  async initUserResumes(): Promise<void> {
    if (!this.user) {
      throw new Error("用户不存在");
    }

    const resumes = await DatabaseInstance.resume.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        created_at: true,
        updated_at: true,
        template: true,
        avatar: true,
      },
      where: {
        user_id: this.user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    this.resumes = resumes.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      published: item.published,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      template: item.template,
      avatar: item.avatar || "",
    }));
  }

  async getUserResumeByID(id: number | string): Promise<{
    id: number;
    title: string;
    content: string;
    published: number;
    createdAt: number;
    updatedAt: number;
    template: number;
    avatar: string;
  }> {
    if (!this.user) {
      throw new Error("用户未登录");
    }

    if (typeof id === "string") {
      id = parseInt(id);
    }

    try {
      varifyInt.parse(id);
    } catch (error) {
      throw new Error("无效的简历 ID");
    }

    const resume = await DatabaseInstance.resume.findUnique({
      select: {
        id: true,
        user_id: true,
        title: true,
        content: true,
        published: true,
        created_at: true,
        updated_at: true,
        template: true,
        avatar: true,
      },
      where: {
        id,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (resume.user_id !== this.user.id) {
      throw new Error("无权访问此简历");
    }

    return {
      id: resume.id,
      title: resume.title,
      content: resume.content,
      published: resume.published,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
      template: resume.template,
      avatar: resume.avatar || "",
    };
  }

  async getPublicResumeByID(id: number | string): Promise<{
    id: number;
    title: string;
    content: string;
    published: number;
    createdAt: number;
    updatedAt: number;
    template: number;
    avatar: string;
  }> {
    if (typeof id === "string") {
      id = parseInt(id);
    }

    try {
      varifyInt.parse(id);
    } catch (error) {
      throw new Error("无效的简历 ID");
    }

    const resume = await DatabaseInstance.resume.findUnique({
      select: {
        id: true,
        user_id: true,
        title: true,
        content: true,
        published: true,
        created_at: true,
        updated_at: true,
        template: true,
        avatar: true,
      },
      where: {
        id,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (resume.published === 0) {
      throw new Error("此简历未发布");
    }

    return {
      id: resume.id,
      title: resume.title,
      content: resume.content,
      published: resume.published,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
      template: resume.template,
      avatar: resume.avatar || "",
    };
  }

  formatResume(resume: {
    id: number;
    title: string;
    content: string;
    published: number;
    createdAt: number;
    updatedAt: number;
    template: number;
    avatar: string;
  }): ResumeGetResponse {
    const jsonContent: ResumeContent = JSON.parse(resume.content);

    const responseBody: ResumeGetResponse = {
      meta: {
        avatar: resume.avatar,
        title: resume.title,
        template: resume.template,
        published: resume.published === 1,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
      content: {
        meta: {
          labelSort: jsonContent.meta?.labelSort || [],
        },
        basic: jsonContent?.basic || [],
        education: jsonContent?.education || [],
        job: jsonContent?.job || [],
        project: jsonContent?.project || [],
        skill: jsonContent?.skill || "",
        custom: {
          label: jsonContent?.custom?.label || "",
          value: jsonContent?.custom?.value || "",
        },
      },
    };

    return responseBody;
  }

  async createResume(payload: {
    title: string;
    template: number;
  }): Promise<number> {
    if (!this.user) {
      throw new Error("用户未登录");
    }

    const resume = await DatabaseInstance.resume.create({
      data: {
        user_id: this.user.id,
        title: payload.title,
        template: payload.template,
        content: JSON.stringify({
          basic: [
            {
              key: "name",
              label: "姓名",
              sort: 0,
              value: "",
            },
            {
              key: "age",
              label: "年龄",
              sort: 1,
              value: "",
            },
            {
              key: "gender",
              label: "性别",
              sort: 2,
              value: "男",
            },
          ],
        }),
        published: 0,
        created_at: dayjs().unix(),
        updated_at: dayjs().unix(),
      },
    });

    return resume.id;
  }

  async updateUserResume(payload: {
    id: number;
    meta?: {
      title?: string;
      template?: number;
      avatar?: string;
      published?: boolean;
    };
    content?: string;
  }): Promise<void> {
    const resume = await this.getUserResumeByID(payload.id);

    await DatabaseInstance.resume.update({
      where: {
        id: payload.id,
      },
      data: {
        title: payload.meta?.title || resume.title,
        template: payload.meta?.template || resume.template,
        avatar:
          payload.meta?.avatar === ""
            ? ""
            : payload.meta?.avatar || resume.avatar,
        published:
          payload.meta?.published === undefined
            ? resume.published
            : payload.meta?.published
              ? 1
              : 0,
        content: payload.content || resume.content,
        updated_at: dayjs().unix(),
      },
    });
  }

  async deleteUserResume(id: number): Promise<void> {
    await DatabaseInstance.resume.delete({
      where: {
        id,
      },
    });
  }

  async deleteAccount(): Promise<void> {
    await this.initUserResumes();

    if (this.resumes.length > 0) {
      for (const resume of this.resumes) {
        await this.deleteUserResume(resume.id);
      }
    }

    await RedisInstance.del(RedisKeyGenerator.generateUserToken(this.user!.id));
    await DatabaseInstance.user.delete({
      where: {
        id: this.user!.id,
      },
    });
  }
}
