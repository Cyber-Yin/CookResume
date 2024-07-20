import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { UserService } from "@/lib/services/user.server";
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

    const userService = new UserService();

    const registered = await userService.checkUserIsRegister({
      email: data.type === "email" ? data.value : undefined,
      name: data.type === "username" ? data.value : undefined,
    });

    return json({
      data: {
        registered,
      },
    });
  } catch (e) {
    console.log(e);
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
