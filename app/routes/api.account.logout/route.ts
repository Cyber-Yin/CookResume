import { ActionFunction, json } from "@remix-run/node";

import { RedisKeyGenerator } from "@/lib/const/redis-key";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import RedisInstance from "@/lib/services/redis.server";
import { destroyUserSession } from "@/lib/services/session.server";
import { formatError } from "@/lib/utils";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { userId } = await checkUserIsLogin(request);

    if (!userId) {
      throw new Error("用户未登录");
    }

    await RedisInstance.del(RedisKeyGenerator.generateUserToken(userId));

    return destroyUserSession(request);
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
