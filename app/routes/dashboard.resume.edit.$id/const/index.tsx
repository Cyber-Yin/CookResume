import BasicEditor from "../components/Editor/Basic";
import TemplateEditor from "../components/Editor/Template";

export const DEFAULT_MENU_ITEMS = [
  {
    key: "resume_setting",
    label: "简历设置",
    editor: TemplateEditor,
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
    label: "教育经历",
    editor: TemplateEditor,
  },
  {
    key: "experience",
    label: "工作经历",
    editor: TemplateEditor,
  },
  {
    key: "skills",
    label: "个人能力",
    editor: TemplateEditor,
  },
  {
    key: "projects",
    label: "项目经验",
    editor: TemplateEditor,
  },
];
