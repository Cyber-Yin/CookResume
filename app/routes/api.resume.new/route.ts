import { ActionFunction, json } from "@remix-run/node";
import dayjs from "dayjs";
import { z } from "zod";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
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
        template: data.template,
        content: JSON.stringify({
          basic: [
            {
              key: "name",
              label: "姓名",
              sort: 0,
              value: "",
            },
            {
              key: "age",
              label: "年龄",
              sort: 1,
              value: "",
            },
            {
              key: "gender",
              label: "性别",
              sort: 2,
              value: "男",
            },
          ],
        }),
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
