import { ActionFunction, json } from "@remix-run/node";
import dayjs from "dayjs";
import { z } from "zod";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, validatePayload } from "@/lib/utils";

const RequestSchema = z.object({
  resume_id: z.number().int().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
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
      throw new Error("无权操作简历");
    }

    const updatedResume = await DatabaseInstance.resume.update({
      where: {
        id: data.resume_id,
      },
      data: {
        title: data.title || resume.title,
        content: data.content || resume.content,
        published: data.published ? 1 : 0,
        updated_at: dayjs().unix(),
      },
    });

    return json({
      data: updatedResume,
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
