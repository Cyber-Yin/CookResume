"use client";

import { useParams } from "@remix-run/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { ScrollArea } from "@/components/ScrollArea";
import { useToast } from "@/components/Toaster/hooks";
import { FADE_IN_ANIMATION } from "@/lib/const/animation";
import { RESUME_TEMPLATE } from "@/lib/const/resume-template";
import { cn, formatError, varifyInt } from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import useResizeObserver from "@/routes/dashboard.resume.edit.$id/hooks/useResizeObserver";

const TemplateEditor: React.FC = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const { resumeInfo, refreshResume, resumeLoading, resumeValidating } =
    useFetchResume();

  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const { ref: editorRef, width: editorWidth } = useResizeObserver();

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!id) {
        throw new Error("简历 ID 不存在");
      }

      try {
        varifyInt.parse(parseInt(id));
      } catch (e) {
        throw new Error("ID 非法");
      }

      setSubmitLoading(true);

      await axios.post("/api/resume/update", {
        resume_id: parseInt(id),
        content: JSON.stringify({
          ...resumeInfo!.rawContent,
          config: {
            ...resumeInfo!.rawContent.config,
            template: selectedTemplate,
          },
        }),
      });

      refreshResume();

      toast({
        title: "保存成功",
        description: "简历已成功保存",
        duration: 5000,
      });
    } catch (e) {
      toast({
        title: "保存失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!resumeInfo) return;

    setSelectedTemplate(resumeInfo.formattedContent.config.template);
  }, [resumeInfo]);

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
                setSelectedTemplate(index);
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-md border-2 border-custom transition-colors hover:border-primary",
                {
                  "border-primary": selectedTemplate === index,
                },
              )}
              key={item.id}
            >
              <img
                className={cn(
                  "h-full w-full transition-all group-hover:brightness-90",
                  {
                    "brightness-90": selectedTemplate === index,
                  },
                )}
                src={item.img}
                alt={item.name}
              />
              {selectedTemplate === index && (
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
