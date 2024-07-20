"use client";

import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { ScrollArea } from "@/components/ScrollArea";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { cn } from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import useResizeObserver from "@/routes/dashboard.resume.edit.$id/hooks/useResizeObserver";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";
import { RESUME_TEMPLATE } from "@/routes/dashboard/const";

const TemplateEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { meta, setMeta } = useResumeContent();
  const isFirstRender = useIsFirstRender();

  const [selectedTemplate, setSelectedTemplate] = useState(0);

  useEffect(() => {
    if (!resumeInfo) return;

    setSelectedTemplate(resumeInfo.meta.template);
  }, [resumeInfo]);

  useEffect(() => {
    if (isFirstRender) return;

    setMeta({
      ...meta,
      template: selectedTemplate,
    });
  }, [selectedTemplate]);

  const { ref: editorRef, width: editorWidth } = useResizeObserver();

  const handleSubmit = async () => {
    await handleFormSubmit({
      meta: {
        template: selectedTemplate,
      },
    });
  };

  return (
    <div
      ref={editorRef}
      className="flex h-[calc(100vh-4rem)] w-full flex-col"
    >
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <div
          className={cn("grid gap-x-4 gap-y-5 overflow-hidden px-5 py-4", {
            "grid-cols-1": editorWidth <= 300,
            "grid-cols-2": editorWidth > 300 && editorWidth <= 900,
            "grid-cols-3": editorWidth > 900,
          })}
        >
          {RESUME_TEMPLATE.map((item, index) => (
            <motion.div
              variants={FADE_IN_ANIMATION}
              initial="hidden"
              animate="visible"
              custom={index}
              onClick={() => {
                setSelectedTemplate(item.id);
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-md border-2 border-custom transition-colors hover:border-primary",
                {
                  "border-primary": selectedTemplate === item.id,
                },
              )}
              key={item.id}
            >
              <img
                className={cn(
                  "h-full w-full object-cover object-top transition-all group-hover:brightness-90",
                  {
                    "brightness-90": selectedTemplate === item.id,
                  },
                )}
                src={item.img}
                alt={item.name}
              />
              {selectedTemplate === item.id && (
                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-1">
                  <Check className="h-full w-full text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading || resumeLoading || resumeValidating}
          onClick={handleSubmit}
        >
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditor;
