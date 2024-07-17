import { create } from "zustand";

import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

interface ResumeContentHook {
  content: ResumeContent;
  meta: ResumeMeta;
  setContent: (content: ResumeContent) => void;
  setMeta: (meta: ResumeMeta) => void;
}

export const useResumeContent = create<ResumeContentHook>((set) => {
  return {
    meta: {
      title: "",
      template: 0,
      published: 0,
      created_at: 0,
      updated_at: 0,
    },
    content: {
      meta: {
        avatar: "",
        labelSort: [],
      },
      basic: [],
      education: [],
      job: [],
      project: [],
      skill: "",
      custom: {
        label: "",
        value: "",
      },
    },
    setContent: (content: ResumeContent) => set({ content }),
    setMeta: (meta: ResumeMeta) => set({ meta }),
  };
});
