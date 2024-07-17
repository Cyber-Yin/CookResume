import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { formatError } from "@/lib/utils";

import CreateResumeCard from "./components/CreateResumeCard";
import ResumeCard from "./components/ResumeCard";

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
        verified: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    const resume = await DatabaseInstance.resume.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        template: true,
        published: true,
        created_at: true,
        updated_at: true,
      },
      where: {
        user_id: userId,
      },
      orderBy: [
        {
          updated_at: "desc",
        },
      ],
    });

    return json({
      user,
      resume,
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

export default function DashboardIndexPage() {
  const { user, resume } = useLoaderData<{
    user: {
      user_name: string;
      avatar: string | null;
      verified: number;
    };
    resume: {
      id: number;
      title: string;
      content: string;
      template: number;
      published: number;
      created_at: number;
      updated_at: number;
    }[];
  }>();

  return (
    <>
      <main className="pt-16">
        <div className="mx-auto w-full max-w-screen-lg space-y-6 px-4 py-8">
          <h1 className="text-2xl font-bold">你好，{user.user_name}！</h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <CreateResumeCard />
            {resume.map((item, index) => (
              <ResumeCard
                key={item.id}
                resume={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
