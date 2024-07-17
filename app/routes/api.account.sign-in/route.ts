import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { RedisKeyGenerator } from "@/lib/const/redis-key";
import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import { createUserSession } from "@/lib/services/session.server";
import {
  formatError,
  generateRandomSalt,
  validateEmail,
  validatePayload,
  verifyPassword,
} from "@/lib/utils";

const RequestSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
        password: true,
        salt: true,
      },
      where: validateEmail(data.account)
        ? {
            email: data.account,
          }
        : {
            user_name: data.account,
          },
    });

    if (!user) {
      throw new Error("该用户不存在");
    }

    if (!verifyPassword(user.password, user.salt, data.password)) {
      throw new Error("用户账号或密码错误");
    }

    const salt = generateRandomSalt();

    await RedisInstance.set(
      RedisKeyGenerator.generateUserToken(user.id),
      salt,
      "EX",
      60 * 60 * 24 * 7,
    );

    return createUserSession(user.id, salt);
  } catch (e) {
    console.log(e);
    return json(
      {
        message: formatError(e),
      },
      {
        status: 400,
      },
    );
  }
};
