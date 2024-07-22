import { LoaderFunction, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import Header from "@/components/Header";
import { UserService } from "@/lib/services/user.server";
import { UserEntity } from "@/lib/types/user";

export const loader: LoaderFunction = async ({ request }) => {
  const userService = new UserService();

  try {
    await userService.autoSignInByCookie(request);
  } catch (e) {}

  if (!userService.user) {
    return redirect("/sign-in");
  }

  return json({ user: userService.user });
};

export default function DashboardPage() {
  const { user } = useLoaderData<{
    user: UserEntity;
  }>();

  return (
    <>
      <Header user={user} />
      <Outlet context={{ user }} />
    </>
  );
}
