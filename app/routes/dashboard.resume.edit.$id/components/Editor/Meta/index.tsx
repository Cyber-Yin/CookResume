"use client";

import { useParams } from "@remix-run/react";
import { useIsFirstRender } from "@uidotdev/usehooks";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import { ScrollArea } from "@/components/ScrollArea";
import { Switch } from "@/components/Switch";
import { useToast } from "@/components/Toaster/hooks";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { useHost } from "@/lib/hooks/useHost";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

const MetaEditor: React.FC = () => {
  const { toast } = useToast();
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { host } = useHost();
  const { content, setContent, meta, setMeta } = useResumeContent();
  const { id } = useParams();
  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<{
    published: number;
    title: string;
    lastModifiedTime: number;
    avatar: string;
  }>({
    published: 0,
    title: "",
    lastModifiedTime: 0,
    avatar: "",
  });

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState({
      published: resumeInfo.meta.published,
      title: resumeInfo.meta.title,
      lastModifiedTime: resumeInfo.meta.updated_at,
      avatar: resumeInfo.content.meta.avatar || "",
    });
  }, [resumeInfo]);

  useEffect(() => {
    if (isFirstRender) return;

    setContent({
      ...content,
      meta: {
        ...content.meta,
        avatar: formState.avatar,
      },
    });

    setMeta({
      ...meta,
      title: formState.title,
      published: formState.published,
    });
  }, [formState]);

  const handleSubmit = async () => {
    if (!formState.title) {
      toast({
        title: "保存失败",
        description: "请输入标题",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    await handleFormSubmit({
      meta: {
        title: formState.title,
        published: formState.published,
      },
      content: JSON.stringify({
        ...resumeInfo!.content,
        meta: {
          ...resumeInfo!.content.meta,
          avatar: formState.avatar || "",
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
            label="标题"
            value={formState.title}
            onValueChange={(value) =>
              setFormState({ ...formState, title: value })
            }
          />

          <div className="flex w-full items-center space-x-1.5">
            <Switch
              checked={formState.published === 1}
              onCheckedChange={(checked) =>
                setFormState({ ...formState, published: checked ? 1 : 0 })
              }
            />
            <Label>是否公开</Label>
          </div>

          <div className="w-full space-y-1.5">
            <Label>在线链接</Label>
            {formState.published === 1 ? (
              <div className="flex w-full items-center space-x-1">
                <div>{`${host}/preview/${id}`}</div>
                <CopyButton content={`${host}/preview/${id}`} />
              </div>
            ) : (
              <div className="w-full">
                <div className="inline rounded-lg bg-red-200 px-2 py-1 text-xs">
                  未公开
                </div>
              </div>
            )}
          </div>

          <div className="w-full space-y-1.5">
            <Label>创建时间</Label>
            <div className="text-sm">
              {dayjs
                .unix(resumeInfo?.meta.created_at || 1)
                .format("YYYY-MM-DD HH:mm")}
            </div>
          </div>
          <div className="w-full space-y-1.5">
            <Label>最后修改时间</Label>
            <div className="text-sm">
              {dayjs
                .unix(resumeInfo?.meta.updated_at || 1)
                .format("YYYY-MM-DD HH:mm")}
            </div>
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

export default MetaEditor;
