import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  resume_id: z.number().int().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    await userService.deleteUserResume(data.resume_id);

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
        status: 500,
      },
    );
  }
};
