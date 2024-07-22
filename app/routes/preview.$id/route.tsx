import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Button } from "@/components/Button";
import { UserService } from "@/lib/services/user.server";
import { ResumeGetResponse } from "@/lib/types/resume";
import { formatError } from "@/lib/utils";

import TemplateKBS from "../dashboard/components/Template/TemplateKBS";
import { RESUME_TEMPLATE } from "../dashboard/const";

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      throw new Error("无效的简历 ID");
    }

    const userService = new UserService();

    const resume = await userService.getPublicResumeByID(id);

    return json({
      data: userService.formatResume(resume),
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

  const TemplateComponent = useMemo(() => {
    if (message) return <></>;

    const template = RESUME_TEMPLATE.find(
      (template) => template.id === data.meta.template,
    );

    if (template && template.template) {
      const Template = template.template;
      return (
        <Template
          content={data.content}
          meta={data.meta}
        />
      );
    } else {
      return (
        <TemplateKBS
          content={data.content}
          meta={data.meta}
        />
      );
    }
  }, [data]);

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
            <div className="tools absolute right-4 top-4 z-10 flex h-8 items-center space-x-2 rounded-lg border border-custom bg-custom p-4 drop-shadow">
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
              contentStyle={{
                transition: "transform 0.08s ease",
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
                {TemplateComponent}
              </motion.div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
