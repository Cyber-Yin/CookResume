import { LoaderFunction, json } from "@remix-run/node";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError, varifyInt } from "@/lib/utils";

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    if (!params.id) {
      throw new Error("缺少简历 ID");
    }

    const resumeId = parseInt(params.id);

    try {
      varifyInt.parse(resumeId);
    } catch (e) {
      throw new Error("无效的简历 ID");
    }

    const { userId } = await checkUserIsLogin(request);

    if (!userId) {
      throw new Error("用户未登录");
    }

    const resume = await DatabaseInstance.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (resume.user_id !== userId) {
      throw new Error("无权访问");
    }

    return json({
      data: resume,
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
