import BasicEditor from "../components/Editor/Basic";
import CustomEditor from "../components/Editor/Custom";
import EducationEditor from "../components/Editor/Education";
import JobEditor from "../components/Editor/Job";
import LabelsortEditor from "../components/Editor/Labelsort";
import MetaEditor from "../components/Editor/Meta";
import ProjectEditor from "../components/Editor/Project";
import SkillEditor from "../components/Editor/Skill";
import TemplateEditor from "../components/Editor/Template";

export const DEFAULT_MENU_ITEMS = [
  {
    key: "meta",
    label: "简历信息",
    editor: MetaEditor,
  },
  {
    key: "labelsort",
    label: "标签排序",
    editor: LabelsortEditor,
  },
  {
    key: "template",
    label: "模板选择",
    editor: TemplateEditor,
  },
  {
    key: "basic",
    label: "基本信息",
    editor: BasicEditor,
  },
  {
    key: "education",
    label: "教育背景",
    editor: EducationEditor,
  },
  {
    key: "experience",
    label: "工作经历",
    editor: JobEditor,
  },
  {
    key: "skill",
    label: "个人技能",
    editor: SkillEditor,
  },
  {
    key: "project",
    label: "项目经验",
    editor: ProjectEditor,
  },
  {
    key: "custom",
    label: "自定义",
    editor: CustomEditor,
  },
];
