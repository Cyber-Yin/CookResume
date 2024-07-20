import { ActionFunction, json } from "@remix-run/node";

import { destroyUserSession } from "@/lib/services/session.server";
import { UserService } from "@/lib/services/user.server";
import { formatError } from "@/lib/utils";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userService = new UserService();

    await userService.logout(request);

    return destroyUserSession(request);
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
