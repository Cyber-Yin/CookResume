import { ActionFunction, json } from "@remix-run/node";
import { sha256 } from "js-sha256";
import { z } from "zod";

import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, generateRandomSalt, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  userName: z
    .string()
    .min(3)
    .max(12)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  email: z.string().email(),
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

    const user = await DatabaseInstance.user.findFirst({
      select: {
        id: true,
      },
      where: {
        OR: [
          {
            user_name: data.userName,
          },
          {
            email: data.email,
          },
        ],
      },
    });

    if (user) {
      throw new Error("该账号已被注册");
    }

    const salt = generateRandomSalt();

    await DatabaseInstance.user.create({
      data: {
        user_name: data.userName,
        email: data.email,
        password: sha256(data.password + salt),
        salt,
        verified: 0,
      },
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
