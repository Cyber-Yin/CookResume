import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import DatabaseInstance from "@/lib/services/prisma.server";
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
