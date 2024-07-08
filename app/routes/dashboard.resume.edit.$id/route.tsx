import { useSearchParams } from "@remix-run/react";
import { useMemo } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/Resizable";
import { ScrollArea } from "@/components/ScrollArea";

import MenuBar from "./components/MenuBar";
import { DEFAULT_MENU_ITEMS } from "./const";

export default function DashboardResumeEditPage() {
  return (
    <>
      <DesktopPanel />
    </>
  );
}

const DesktopPanel: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    return searchParams.get("tab") || "basic";
  }, [searchParams]);

  const EditorComponent = useMemo(() => {
    return DEFAULT_MENU_ITEMS.find((item) => item.key === tab)?.editor;
  }, [tab]);

  return (
    <main className="flex h-screen min-h-screen bg-custom-secondary pt-16">
      <MenuBar />
      <ResizablePanelGroup
        className="h-full w-full grow"
        direction="horizontal"
      >
        <ResizablePanel defaultSize={50}>
          {EditorComponent ? <EditorComponent /> : null}
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
