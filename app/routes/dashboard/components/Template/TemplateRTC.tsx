import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

import BasicPreview from "../BasicPreview";
import CustomPreview from "../CustomPreview";
import EducationPreview from "../EducationPreview";
import JobPreview from "../JobPreview";
import ProjectPreview from "../ProjectPreview";
import SkillPreview from "../SkillPreview";

const TemplateRTC: React.FC<{
  content?: ResumeContent;
  meta?: ResumeMeta;
}> = ({ content, meta }) => {
  if (!content || !meta) {
    return <></>;
  }

  if (content.basic.length === 0) {
    return <></>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center text-2xl font-semibold text-[#3978a3]">
        {meta.title}
      </div>

      {content.meta.labelSort.length > 0 ? (
        <>
          {content.meta.labelSort.map((label) => {
            switch (label) {
              case "basic":
                return (
                  <BasicPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              case "education":
                return (
                  <EducationPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              case "job":
                return (
                  <JobPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              case "project":
                return (
                  <ProjectPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              case "skill":
                return (
                  <SkillPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              case "custom":
                return (
                  <CustomPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_rtc"
                  />
                );
              default:
                return null;
            }
          })}
        </>
      ) : (
        <>
          <BasicPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
          <EducationPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
          <SkillPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
          <JobPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
          <ProjectPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
          <CustomPreview
            content={content}
            meta={meta}
            template="template_rtc"
          />
        </>
      )}
    </div>
  );
};

export default TemplateRTC;
