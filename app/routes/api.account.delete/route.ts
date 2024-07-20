import { ActionFunction, json } from "@remix-run/node";

import { UserService } from "@/lib/services/user.server";
import { formatError } from "@/lib/utils";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    await userService.deleteAccount();

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
        status: 500,
      },
    );
  }
};
