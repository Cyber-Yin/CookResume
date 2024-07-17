import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { RedisKeyGenerator } from "@/lib/const/redis-key";
import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  verification_code: z.string(),
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

    const { user_id, type, email } = JSON.parse(verificationEntity) as {
      user_id: number;
      type: string;
      email: string;
    };

    if (type !== "changeEmail") {
      throw new Error("验证码类型错误");
    }

    if (!email) {
      throw new Error("验证码邮箱错误");
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

    await DatabaseInstance.$transaction(async () => {
      await DatabaseInstance.user.update({
        data: {
          email,
          verified: 1,
        },
        where: {
          id: user.id,
        },
      });

      await RedisInstance.del(
        RedisKeyGenerator.generateVerificationCode(data.verification_code),
      );
    });

    return json({
      success: true,
    });
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
