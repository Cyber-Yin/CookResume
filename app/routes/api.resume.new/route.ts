import { ActionFunction, json } from "@remix-run/node";
import dayjs from "dayjs";
import { z } from "zod";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

type RequestSchemaType = z.infer<typeof RequestSchema>;

export const action: ActionFunction = async ({ request }) => {
  try {
    const data: RequestSchemaType = await request.json();

    validatePayload(RequestSchema, data);

    const { isLogin, userId } = await checkUserIsLogin(request);

    if (!isLogin || !userId) {
      throw new Error("用户未登录");
    }

    const user = await DatabaseInstance.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    const resume = await DatabaseInstance.resume.create({
      data: {
        title: data.title,
        user_id: userId,
        content: data.content,
        published: 0,
        created_at: dayjs().unix(),
        updated_at: dayjs().unix(),
      },
    });

    return json({
      data: {
        id: resume.id,
      },
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
