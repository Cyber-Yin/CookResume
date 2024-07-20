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
      avatar: "",
      title: "",
      template: 0,
      published: false,
      createdAt: 0,
      updatedAt: 0,
    },
    content: {
      meta: {
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
