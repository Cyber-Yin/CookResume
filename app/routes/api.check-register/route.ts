import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import DatabaseInstance from "@/lib/services/prisma.server";
import RedisInstance from "@/lib/services/redis.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  type: z.union([z.literal("username"), z.literal("email")]),
  value: z.string().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const cache = await RedisInstance.get(
      `check_register:${data.type}:${data.value}`,
    );

    if (cache) {
      return json({
        registered: true,
      });
    }

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
      },
      where:
        data.type === "email"
          ? {
              email: data.value,
            }
          : {
              user_name: data.value,
            },
    });

    if (user) {
      RedisInstance.set(
        `check_register:${data.type}:${data.value}`,
        user.id,
        "EX",
        60 * 5,
        "NX",
      );
    }

    return json({
      registered: user ? true : false,
    });
  } catch (e) {
    return json(
      {
        message: formatError(e),
      },
      {
        status: 500,
      },
    );
  }
};
