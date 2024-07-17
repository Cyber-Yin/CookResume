import { ActionFunction, json } from "@remix-run/node";
import dayjs from "dayjs";
import { z } from "zod";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  resume_id: z.number().int().min(1),
  meta: z
    .object({
      title: z.string().optional(),
      template: z.number().int().min(0).optional(),
      published: z.union([z.literal(0), z.literal(1)]).optional(),
    })
    .optional(),
  content: z.string().optional(),
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

    const resume = await DatabaseInstance.resume.findUnique({
      where: {
        id: data.resume_id,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (resume.user_id !== userId) {
      throw new Error("无权访问");
    }

    await DatabaseInstance.resume.update({
      where: {
        id: data.resume_id,
      },
      data: {
        title: data.meta?.title || resume.title,
        content: data.content || resume.content,
        published: data.meta?.published === 1 ? 1 : 0,
        template: data.meta?.template || resume.template,
        updated_at: dayjs().unix(),
      },
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
