import { ResumeBasicData } from "../types/resume";

export type BasicDataFormState = {
  [key: string]: {
    isCustom: boolean;
    label: string;
    sort: number;
    value: string;
  };
};

export const BasicDataFields = [
  {
    key: "name",
    label: "姓名",
  },
  {
    key: "age",
    label: "年龄",
  },
  {
    key: "gender",
    label: "性别",
    default: "男",
  },
  {
    key: "phone",
    label: "电话",
  },
  {
    key: "email",
    label: "邮箱",
  },
  {
    key: "job",
    label: "意向岗位",
  },
  {
    key: "education",
    label: "学历",
  },
];

export const formatResumeBasicData = (data: ResumeBasicData[]) => {
  const initialState = BasicDataFields.reduce<BasicDataFormState>(
    (acc, field, index) => {
      return {
        ...acc,
        [field.key]: {
          label: field.label,
          isCustom: false,
          sort: index,
          value: field.default || "",
        },
      };
    },
    {},
  );

  data.forEach((item) => {
    if (initialState[item.key]) {
      initialState[item.key].sort = item.sort;
      initialState[item.key].value = item.value;
    } else {
      initialState[item.key] = {
        label: item.label || item.key,
        sort: item.sort,
        isCustom: true,
        value: item.value,
      };
    }
  });

  return initialState;
};
