import { ActionFunction, json } from "@remix-run/node";
import { sha256 } from "js-sha256";
import { z } from "zod";

import { RedisKeyGenerator } from "@/lib/const/redis-key";
import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import { formatError, generateRandomSalt, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  verification_code: z.string().length(6),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const verificationEntity = await RedisInstance.get(
      RedisKeyGenerator.generateVerificationCode(data.verification_code),
    );

    if (!verificationEntity) {
      throw new Error("验证码不存在或已过期");
    }

    const { user_id, type } = JSON.parse(verificationEntity) as {
      user_id: number;
      type: string;
    };

    if (!["forgotPassword", "changePassword"].includes(type)) {
      throw new Error("验证码类型错误");
    }

    const user = await DatabaseInstance.user.findUnique({
      select: { id: true },
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new Error("该账号不存在");
    }

    const passwordSalt = generateRandomSalt();

    await DatabaseInstance.$transaction(async () => {
      await DatabaseInstance.user.update({
        data: {
          password: sha256(data.password + passwordSalt),
          salt: passwordSalt,
        },
        where: {
          id: user.id,
        },
      });

      await RedisInstance.multi()
        .del(RedisKeyGenerator.generateVerificationCode(data.verification_code))
        .del(RedisKeyGenerator.generateUserToken(user.id))
        .exec();
    });

    return json({
      success: true,
    });
  } catch (e) {
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
