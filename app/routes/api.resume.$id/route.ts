import { LoaderFunction, json } from "@remix-run/node";

import { UserService } from "@/lib/services/user.server";
import { formatError } from "@/lib/utils";

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    if (!params.id) {
      throw new Error("缺少简历 ID");
    }

    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    const resume = await userService.getUserResumeByID(params.id);

    return json({
      data: userService.formatResume(resume),
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
