import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Button } from "@/components/Button";
import DatabaseInstance from "@/lib/services/prisma.server";
import { ResumeContent, ResumeGetResponse } from "@/lib/types/resume";
import { formatError, varifyInt } from "@/lib/utils";

import TemplateKBS from "../dashboard/components/Template/TemplateKBS";

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      throw new Error("简历 ID 不存在");
    }

    const intId = parseInt(id);

    try {
      varifyInt.parse(intId);
    } catch (e) {
      throw new Error("简历 ID 参数错误");
    }

    const resume = await DatabaseInstance.resume.findUnique({
      where: {
        id: intId,
      },
    });

    if (!resume) {
      throw new Error("简历不存在");
    }

    if (!resume.published) {
      throw new Error("简历未发布");
    }

    const jsonContent: ResumeContent = JSON.parse(resume.content);

    const responseBody: ResumeGetResponse = {
      meta: {
        title: resume.title,
        template: resume.template,
        published: resume.published,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
      content: {
        meta: {
          avatar: jsonContent.meta?.avatar || "",
          labelSort: jsonContent.meta?.labelSort || [],
        },
        basic: jsonContent?.basic || [],
        education: jsonContent?.education || [],
        job: jsonContent?.job || [],
        project: jsonContent?.project || [],
        skill: jsonContent?.skill || "",
        custom: {
          label: jsonContent?.custom?.label || "",
          value: jsonContent?.custom?.value || "",
        },
      },
    };

    return json({
      data: responseBody,
    });
  } catch (e) {
    console.log(e);
    return json({
      message: formatError(e),
    });
  }
};

export default function PreviewPage() {
  const { data, message } = useLoaderData<{
    data: ResumeGetResponse;
    message: string;
  }>();

  const navigate = useNavigate();

  if (message) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">{message}</h1>
        <Button onClick={() => navigate("/")}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <TransformWrapper
        initialScale={0.7}
        minScale={0.4}
        onInit={(ref) => {
          setTimeout(() => {
            ref.centerView();
          }, 300);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <div className="relative h-full w-full">
            <div className="tools absolute right-4 top-4 z-10 flex h-8 items-center space-x-2 rounded-lg bg-custom p-4">
              <ZoomIn
                onClick={() => zoomIn()}
                className="h-4 w-4 cursor-pointer transition-colors hover:text-primary"
              />
              <ZoomOut
                onClick={() => zoomOut()}
                className="h-4 w-4 cursor-pointer transition-colors hover:text-primary"
              />
              <RotateCcw
                onClick={() => resetTransform()}
                className="h-4 w-4 cursor-pointer transition-colors hover:text-primary"
              />
            </div>
            <TransformComponent
              wrapperStyle={{
                backgroundColor: "#404040",
                width: "100%",
                height: "100%",
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.5,
                }}
                className="w-[794px] bg-white p-6"
              >
                <TemplateKBS
                  content={data.content}
                  meta={data.meta}
                />
              </motion.div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
