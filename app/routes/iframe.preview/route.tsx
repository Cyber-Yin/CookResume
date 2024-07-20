"use client";

import { useEffect, useMemo, useState } from "react";

import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

import TemplateKBS from "../dashboard/components/Template/TemplateKBS";
import { RESUME_TEMPLATE } from "../dashboard/const";

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
  }, [content, meta]);

  const TemplateComponent = useMemo(() => {
    const template = RESUME_TEMPLATE.find(
      (template) => template.id === meta?.template,
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

  if (!content || !meta) {
    return <></>;
  }

  return <div className="w-[794px] bg-white">{TemplateComponent}</div>;
}
