import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";

import { UserService } from "@/lib/services/user.server";
import { ResumeEntity } from "@/lib/types/resume";
import { UserEntity } from "@/lib/types/user";
import { formatError } from "@/lib/utils";

import CreateResumeCard from "./components/CreateResumeCard";
import ResumeCard from "./components/ResumeCard";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const userService = new UserService();

    await userService.autoSignInByCookie(request);

    await userService.initUserResumes();

    return json({
      resume: userService.resumes,
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
  const { resume } = useLoaderData<{
    resume: ResumeEntity[];
  }>();

  const { user } = useOutletContext<{
    user: UserEntity;
  }>();

  return (
    <>
      <main className="pt-16">
        <div className="mx-auto w-full max-w-screen-lg space-y-6 px-4 py-8">
          <h1 className="text-2xl font-bold">你好，{user.name}！</h1>
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
