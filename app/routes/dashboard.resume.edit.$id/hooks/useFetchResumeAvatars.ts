import axios from "axios";
import useSWR from "swr";

export const useFetchResumeAvatars = () => {
  const { data, isValidating, isLoading, mutate } = useSWR(
    `/api/account/resume-avatar`,
    async (url) => {
      try {
        const { data } = await axios.get<{
          data: {
            id: number;
            url: string;
          }[];
        }>(url, {
          withCredentials: true,
        });

        return data.data;
      } catch (e) {
        return [];
      }
    },
  );

  return {
    resumeAvatars: data,
    resumeAvatarsIsValidating: isValidating,
    resumeAvatarsIsLoading: isLoading,
    refetchResumeAvatars: mutate,
  };
};
