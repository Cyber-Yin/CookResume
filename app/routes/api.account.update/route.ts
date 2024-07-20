import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  action: z.enum(["updateUsername"]),
  user_name: z
    .string()
    .min(3)
    .max(12)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)
    .optional(),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    if (data.action === "updateUsername" && !data.user_name) {
      throw new Error("用户名不能为空");
    }

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    await userService.updateUserInfo({
      name: data.user_name,
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
