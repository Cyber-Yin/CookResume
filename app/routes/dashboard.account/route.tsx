import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";

import { Button } from "@/components/Button";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError } from "@/lib/utils";

import AvatarSetting from "./components/AvatarSetting";
import EmailSetting from "./components/EmailSetting";
import UsernameSetting from "./components/UsernameSetting";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { userId } = await checkUserIsLogin(request);

    if (!userId) {
      throw new Error("未登录");
    }

    const user = await DatabaseInstance.user.findUnique({
      select: {
        user_name: true,
        avatar: true,
        email: true,
        verified: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    return json({
      user,
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

export default function DashboardAccountPage() {
  const { user } = useLoaderData<{
    user: {
      user_name: string;
      avatar: string | null;
      email: string;
      verified: number;
    };
  }>();

  return (
    <main className="pt-16">
      <div className="mx-auto w-full max-w-screen-lg space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">账号设置</h1>
        <div className="space-y-4">
          <AvatarSetting
            index={0}
            avatar={user.avatar}
            userName={user.user_name}
          />
          <UsernameSetting
            index={1}
            userName={user.user_name}
          />
          <EmailSetting
            index={2}
            email={user.email}
            verified={user.verified === 1}
          />
          <motion.div
            variants={FADE_IN_ANIMATION}
            custom={3}
            initial="hidden"
            animate="visible"
            className="flex w-full justify-end"
          >
            <Button variant="destructive">删除账号</Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
