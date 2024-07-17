import { ActionFunction, json } from "@remix-run/node";
import { z } from "zod";

import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  user_id: z.number().int().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const user = await DatabaseInstance.user.findUnique({
      select: {
        verified: true,
      },
      where: {
        id: data.user_id,
      },
    });

    return json({
      verified: !user || !user.verified ? false : true,
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
