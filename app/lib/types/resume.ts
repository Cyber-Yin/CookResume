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
  education: EducationFormState[];
  job: JobFormState[];
  project: ProjectFormState[];
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
  education: EducationFormState[];
  job: JobFormState[];
  project: ProjectFormState[];
};

export type BasicDataFormState = {
  [key: string]: {
    isCustom: boolean;
    label: string;
    sort: number;
    value: string;
  };
};

export type EducationFormState = {
  experience: string;
  sort: number;
  school: string;
  major: string;
  startDate: string;
  endDate: string;
};

export type JobFormState = {
  experience: string;
  sort: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
};

export type ProjectFormState = {
  name: string;
  sort: number;
  description: string;
};
