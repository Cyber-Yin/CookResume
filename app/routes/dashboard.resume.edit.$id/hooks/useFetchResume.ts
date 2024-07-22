import { useParams } from "@remix-run/react";
import axios from "axios";
import useSWR from "swr";

import { useToast } from "@/components/Toaster/hooks";
import { ResumeGetResponse } from "@/lib/types/resume";
import { formatError } from "@/lib/utils";

import { useResumeContent } from "./useResumeContent";

export const useFetchResume = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { setContent, setMeta } = useResumeContent();

  const { data, isValidating, isLoading, mutate } = useSWR(
    id ? `/api/resume/${id}` : null,
    async (url) => {
      try {
        const { data } = await axios.get<{
          data: ResumeGetResponse;
        }>(url, {
          withCredentials: true,
        });

        setContent(data.data.content);
        setMeta(data.data.meta);

        return {
          content: data.data.content,
          meta: data.data.meta,
        };
      } catch (e) {
        toast({
          title: "获取简历内容失败",
          description: formatError(e),
          duration: 5000,
          variant: "destructive",
        });
        return null;
      }
    },
  );

  return {
    resumeInfo: data,
    resumeValidating: isValidating,
    resumeLoading: isLoading,
    refreshResume: mutate,
  };
};
