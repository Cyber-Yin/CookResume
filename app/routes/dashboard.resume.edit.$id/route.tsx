import { useNavigate, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { toSvg } from "html-to-image";
import {
  ChevronLeft,
  FileInput,
  FolderInput,
  RotateCcw,
  SquareChevronLeft,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/Resizable";
import Viewer from "@/components/RichText/Viewer";
import { ScrollArea } from "@/components/ScrollArea";
import { cn, sleep } from "@/lib/utils";

import TemplateKBS from "../dashboard/components/Template/TemplateKBS";
import { RESUME_TEMPLATE } from "../dashboard/const";
import MenuBar, { MenuBarVariants } from "./components/MenuBar";
import { DEFAULT_MENU_ITEMS } from "./const";
import { useResumeContent } from "./hooks/useResumeContent";

export default function DashboardResumeEditPage() {
  return (
    <>
      <DesktopPanel />
    </>
  );
}

const DesktopPanel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { content, meta } = useResumeContent();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tab = useMemo(() => {
    return searchParams.get("tab") || "meta";
  }, [searchParams]);

  const EditorComponent = useMemo(() => {
    return DEFAULT_MENU_ITEMS.find((item) => item.key === tab)?.editor;
  }, [tab]);

  const TemplateComponent = useMemo(() => {
    const template = RESUME_TEMPLATE.find(
      (template) => template.id === meta.template,
    );

    if (template && template.template) {
      const Template = template.template;

      return (
        <Template
          content={content}
          meta={meta}
        />
      );
    } else {
      return (
        <TemplateKBS
          content={content}
          meta={meta}
        />
      );
    }
  }, [content, meta]);

  const handleExport = async () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        content,
        meta,
      },
      "*",
    );
  }, [content, meta]);

  return (
    <main className="flex h-screen bg-custom-secondary pt-16">
      <div className="flex h-full w-60 shrink-0 flex-col border-r bg-custom">
        <MenuBar />
        <motion.div
          initial="hidden"
          animate="visible"
          custom={DEFAULT_MENU_ITEMS.length}
          variants={MenuBarVariants}
          className="px-2"
        >
          <div
            onClick={() => navigate("/dashboard")}
            className="mb-2 flex cursor-pointer items-center space-x-2 rounded bg-primary px-4 py-3"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
            <div className="font-semibold text-white">我的简历</div>
          </div>
        </motion.div>
      </div>

      <ResizablePanelGroup
        className="h-full w-full grow"
        direction="horizontal"
      >
        <ResizablePanel defaultSize={50}>
          {EditorComponent ? <EditorComponent /> : null}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <>
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
                <div className="relative">
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
                    <FolderInput
                      onClick={() => handleExport()}
                      className="h-4 w-4 cursor-pointer transition-colors hover:text-primary"
                    />
                  </div>
                  <TransformComponent
                    wrapperStyle={{
                      backgroundColor: "#404040",
                      width: "100%",
                      height: "calc(100vh - 4rem)",
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
          </>
        </ResizablePanel>
      </ResizablePanelGroup>
      <iframe
        className="hidden"
        ref={iframeRef}
        src="/iframe/preview"
      ></iframe>
    </main>
  );
};

const MobilePanel = () => {
  return <div>MobilePanel</div>;
};
