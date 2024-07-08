import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useMemo } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/Resizable";
import { ScrollArea } from "@/components/ScrollArea";
import { checkUserIsLogin } from "@/lib/services/auth.server";
import DatabaseInstance from "@/lib/services/prisma.server";
import { ResumeData, ResumeDetailResponse } from "@/lib/types/resume";
import { formatError, varifyInt } from "@/lib/utils";

import MenuBar from "./components/MenuBar";
import { DEFAULT_MENU_ITEMS } from "./const";

export const loader: LoaderFunction = async ({ params, request }) => {
  try {
    if (!params.id) {
      throw new Error("缺少简历 ID");
    }

    const resumeId = parseInt(params.id);

    try {
      varifyInt.parse(resumeId);
    } catch (e) {
      throw new Error("无效的简历 ID");
    }

    const { userId } = await checkUserIsLogin(request);

    if (!userId) {
      throw new Error("用户未登录");
    }

    const resume = await DatabaseInstance.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (resume.user_id !== userId) {
      throw new Error("无权访问");
    }

    return json({
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

export default function DashboardResumeEditPage() {
  const { resume } = useLoaderData<{
    resume: ResumeDetailResponse;
  }>();
  return (
    <>
      <DesktopPanel resume={resume} />
    </>
  );
}

const DesktopPanel: React.FC<{
  resume: ResumeDetailResponse;
}> = ({ resume }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    return searchParams.get("tab") || "basic";
  }, [searchParams]);

  const editor = useMemo(() => {
    return DEFAULT_MENU_ITEMS.find((item) => item.key === tab)?.editor;
  }, [tab]);

  const data: ResumeData = useMemo(() => {
    return JSON.parse(resume.content);
  }, [resume]);

  return (
    <main className="flex h-screen min-h-screen bg-custom-secondary pt-16">
      <MenuBar />
      <ResizablePanelGroup
        className="h-full w-full grow"
        direction="horizontal"
      >
        <ResizablePanel defaultSize={50}>
          {editor
            ? editor({
                data,
              })
            : null}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-full w-full">
            <TransformWrapper
              initialScale={1}
              initialPositionX={200}
              initialPositionY={100}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                  <div className="tools h-8">
                    <button onClick={() => zoomIn()}>+</button>
                    <button onClick={() => zoomOut()}>-</button>
                    <button onClick={() => resetTransform()}>x</button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{
                      width: "100%",
                      height: "calc(100vh - 6rem)",
                    }}
                  >
                    <div className="text-2xl font-bold">简历预览</div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

const MobilePanel = () => {
  return <div>MobilePanel</div>;
};
