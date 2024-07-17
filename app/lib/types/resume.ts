export type ResumeMetaData = {
  avatar?: string;
  labelSort: string[];
};

export type ResumeMeta = {
  title: string;
  template: number;
  published: number;
  created_at: number;
  updated_at: number;
};

export type ResumeBasicData = {
  key: string;
  label: string;
  sort: number;
  value: string;
};

export type ResumeEducationData = {
  key: string;
  experience: string;
  sort: number;
  school: string;
  major: string;
  startDate: string;
  endDate: string;
};

export type ResumeJobData = {
  key: string;
  experience: string;
  sort: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
};

export type ResumeProjectData = {
  key: string;
  name: string;
  sort: number;
  description: string;
};

export type ResumeCustomData = {
  label: string;
  value: string;
};

export type ResumeContent = {
  meta: ResumeMetaData;
  basic: ResumeBasicData[];
  education: ResumeEducationData[];
  job: ResumeJobData[];
  project: ResumeProjectData[];
  skill: string;
  custom: ResumeCustomData;
};

export type ResumeGetResponse = {
  meta: ResumeMeta;
  content: ResumeContent;
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
  [key: string]: {
    experience: string;
    sort: number;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
  };
};

export type JobFormState = {
  [key: string]: {
    experience: string;
    sort: number;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
  };
};

export type ProjectFormState = {
  [key: string]: {
    name: string;
    sort: number;
    description: string;
  };
};
