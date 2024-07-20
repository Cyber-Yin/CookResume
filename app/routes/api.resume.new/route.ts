import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  title: z.string().min(1),
  template: z.number().int().min(0),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    const resumeID = await userService.createResume(data);

    return json({
      data: {
        id: resumeID,
      },
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
