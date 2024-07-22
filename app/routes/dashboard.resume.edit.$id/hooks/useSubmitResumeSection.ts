import { useParams } from "@remix-run/react";
import axios from "axios";
import { useState } from "react";

import { useToast } from "@/components/Toaster/hooks";
import { formatError, varifyInt } from "@/lib/utils";

import { useFetchResume } from "./useFetchResume";

export const useSubmitResumeSection = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { refreshResume } = useFetchResume();

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (data: any) => {
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
        ...data,
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

  return { handleFormSubmit: handleSubmit, submitLoading };
};
