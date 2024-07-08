import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import Header from "@/components/Header";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { UserResponse } from "@/lib/types/user";

export const loader: LoaderFunction = async ({ request }) => {
  const { isLogin, userId } = await checkUserIsLogin(request);

  if (!isLogin || !userId) {
    return redirect("/sign-in");
  }

  const user = await DatabaseInstance.user.findUnique({
    select: {
      id: true,
      user_name: true,
      email: true,
      avatar: true,
      verified: true,
    },
    where: {
      id: userId,
    },
  });

  if (!user) {
    return redirect("/sign-in");
  }

  return json({ user });
};

export default function DashboardPage() {
  const { user } = useLoaderData<{
    user: UserResponse;
  }>();

  return (
    <>
      <Header user={user} />
      <Outlet context={{ user }} />
    </>
  );
}
