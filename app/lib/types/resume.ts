export type ResumeConfig = {
  template: number;
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
