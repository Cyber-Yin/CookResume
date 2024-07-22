import TemplateDCV from "../components/Template/TemplateDCV";
import TemplateKBS from "../components/Template/TemplateKBS";
import TemplateRTC from "../components/Template/TemplateRTC";
import TemplateXAI from "../components/Template/TemplateXAI";

export const RESUME_TEMPLATE = [
  {
    id: 1,
    name: "KBS",
    img: "/resume-template/t1.png",
    template: TemplateKBS,
  },
  {
    id: 2,
    name: "RTC",
    img: "/resume-template/t2.png",
    template: TemplateRTC,
  },
  {
    id: 3,
    name: "XAI",
    img: "/resume-template/t3.png",
    template: TemplateXAI,
  },
  {
    id: 4,
    name: "DCV",
    img: "/resume-template/t4.png",
    template: TemplateDCV,
  },
];
