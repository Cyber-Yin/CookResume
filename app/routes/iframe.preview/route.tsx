import { useEffect, useState } from "react";

import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

import TemplateKBS from "../dashboard/components/Template/TemplateKBS";

export default function IframePreview() {
  const [content, setContent] = useState<ResumeContent>();
  const [meta, setMeta] = useState<ResumeMeta>();

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.data.content && event.data.meta) {
        setContent(event.data.content);
        setMeta(event.data.meta);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  if (!content || !meta) {
    return <></>;
  }

  return (
    <div className="w-[794px] bg-white">
      <TemplateKBS
        content={content}
        meta={meta}
      />
    </div>
  );
}
