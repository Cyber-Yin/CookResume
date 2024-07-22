import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import { UserService } from "@/lib/services/user.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  resume_id: z.number().int().min(1),
  meta: z
    .object({
      title: z.string().optional(),
      template: z.number().int().min(0).optional(),
      published: z.boolean().optional(),
    })
    .optional(),
  content: z.string().optional(),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    await userService.updateUserResume({
      id: data.resume_id,
      meta: data.meta,
      content: data.content,
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
