import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { createUserSession } from "@/lib/services/session.server";
import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    const { token, userID } = await userService.signIn({
      account: data.account,
      password: data.password,
    });

    return createUserSession(userID, token);
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
