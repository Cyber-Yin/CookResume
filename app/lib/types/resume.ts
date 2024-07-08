export type ResumeConfig = {
  template: number;
  avatar?: string;
};

export type ResumeBasicData = {
  key: string;
  label: string;
  sort: number;
  value: string;
};

export type ResumeData = {
  config: ResumeConfig;
  basic: ResumeBasicData[];
};

export type ResumeDetailResponse = {
  title: string;
  content: string;
  published: number;
  created_at: number;
  updated_at: number;
};

export type FormattedResumeContent = {
  config: ResumeConfig;
  basic: Record<
    string,
    {
      isCustom: boolean;
      label: string;
      value: string;
      sort: number;
    }
  >;
};
