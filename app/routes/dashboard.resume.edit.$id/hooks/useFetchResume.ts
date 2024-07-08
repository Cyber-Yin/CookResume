import { useParams } from "@remix-run/react";
import axios from "axios";
import useSWR from "swr";

import { useToast } from "@/components/Toaster/hooks";
import { FormattedResumeContent, ResumeData } from "@/lib/types/resume";
import { formatError } from "@/lib/utils";
import { formatResumeBasicData } from "@/lib/utils/resume";

export const useFetchResume = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data, isValidating, isLoading, mutate } = useSWR(
    id ? `/api/resume/${id}` : null,
    async (url) => {
      try {
        const { data } = await axios.get<{
          data: {
            title: string;
            content: string;
            published: number;
            created_at: number;
            updated_at: number;
          };
        }>(url, {
          withCredentials: true,
        });

        const jsonContent: ResumeData = JSON.parse(data.data.content);

        const formattedContent: FormattedResumeContent = {
          config: jsonContent.config,
          basic: formatResumeBasicData(jsonContent.basic || []),
        };

        return {
          title: data.data.title,
          formattedContent: formattedContent,
          rawContent: jsonContent,
          published: data.data.published ? true : false,
          createdAt: data.data.created_at,
          updatedAt: data.data.updated_at,
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
