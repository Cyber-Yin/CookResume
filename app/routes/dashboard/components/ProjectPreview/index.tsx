import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

const LableName = "项目经验";

const ProjectPreview: React.FC<{
  content: ResumeContent;
  meta: ResumeMeta;
  template: string;
}> = ({ content, meta, template }) => {
  if (content.project.length === 0) {
    return null;
  }

  switch (template) {
    case "template_kbs":
      return (
        <div
          key={template}
          className="w-full space-y-3"
        >
          <div className="flex w-full items-center space-x-2">
            <div
              style={{
                clipPath:
                  "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
              }}
              className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
            >
              {LableName}
            </div>
            <div className="h-[1px] w-full grow bg-black"></div>
          </div>
          {content.project.map((item) => {
            return (
              <div
                key={item.key}
                className="w-full space-y-2 px-3"
              >
                <div className="flex w-full items-center justify-between font-semibold text-slate-500">
                  <div>{item.name}</div>
                </div>
                {item.description && <Viewer content={item.description} />}
              </div>
            );
          })}
        </div>
      );
    case "template_rtc":
      return (
        <div
          key={template}
          className="w-full space-y-3"
        >
          <div className="flex w-full items-center bg-[rgba(57,120,163,0.12)]">
            <div className="bg-[#3978a3] px-4 py-1 text-lg font-semibold text-white">
              {LableName}
            </div>
          </div>
          {content.project.map((item) => {
            return (
              <div
                key={item.key}
                className="w-full space-y-2 px-3"
              >
                <div className="flex w-full items-center justify-between font-semibold">
                  <div>{item.name}</div>
                </div>
                {item.description && <Viewer content={item.description} />}
              </div>
            );
          })}
        </div>
      );
    case "template_xai":
      return (
        <div
          key={template}
          className="w-full space-y-3"
        >
          <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
            <div
              style={{
                clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
              }}
              className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
            >
              {LableName}
            </div>
          </div>
          {content.project.map((item) => {
            return (
              <div
                key={item.key}
                className="w-full space-y-2"
              >
                <div className="flex w-full items-center justify-between font-semibold">
                  <div>{item.name}</div>
                </div>
                {item.description && <Viewer content={item.description} />}
              </div>
            );
          })}
        </div>
      );
    case "template_dcv":
      return (
        <div
          key={template}
          className="w-full space-y-3"
        >
          <div className="flex w-full items-center space-x-2 border-b border-black">
            <div className="shrink-0 text-lg font-semibold text-black">
              {LableName}
            </div>
          </div>
          {content.project.map((item) => {
            return (
              <div
                key={item.key}
                className="w-full space-y-2"
              >
                <div className="flex w-full items-center justify-between font-semibold">
                  <div>{item.name}</div>
                </div>
                {item.description && <Viewer content={item.description} />}
              </div>
            );
          })}
        </div>
      );
    default:
      return null;
  }
};

export default ProjectPreview;
