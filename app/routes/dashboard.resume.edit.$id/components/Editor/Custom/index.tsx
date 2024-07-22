"use client";

import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import Editor from "@/components/RichText/Editor";
import { ScrollArea } from "@/components/ScrollArea";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { checkRichTextOutputIsNull } from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

const CustomEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();
  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState({
    label: "",
    value: "",
  });

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState(resumeInfo.content.custom);
  }, [resumeInfo]);

  useEffect(() => {
    if (isFirstRender) return;

    setContent({
      ...content,
      custom: {
        label: formState.label,
        value: checkRichTextOutputIsNull(formState.value),
      },
    });
  }, [formState]);

  const handleSubmit = async () => {
    await handleFormSubmit({
      content: JSON.stringify({
        ...resumeInfo!.content,
        custom: {
          label: formState.label,
          value: checkRichTextOutputIsNull(formState.value),
        },
      }),
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <motion.div
          variants={OPACITY_ANIMATION}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col space-y-4 px-5 py-4"
        >
          <FormInput
            label="标签"
            value={formState.label}
            onValueChange={(value) =>
              setFormState({ ...formState, label: value })
            }
          />
          <div className="w-full space-y-1.5">
            <Label>内容</Label>
            <Editor
              content={formState.value}
              onChange={(value) => setFormState({ ...formState, value })}
            />
          </div>
        </motion.div>
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

export default CustomEditor;
