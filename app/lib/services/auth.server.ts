import RedisInstance from "./redis.server";
import { getUserSession } from "./session.server";

export const authLoginAction = async () => {};

export const checkUserIsLogin = async (request: Request) => {
  const session = await getUserSession(request);

  const userId = session.get("userId") as number;
  const token = session.get("token");

  if (!userId || !token) {
    return { isLogin: false, userId: null };
  }

  const salt = await RedisInstance.get(`user:${userId}:token`);

  if (salt !== token) {
    return { isLogin: false, userId: null };
  }

  return { isLogin: true, userId };
};
