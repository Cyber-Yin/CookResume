import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

import BasicPreview from "../BasicPreview";
import CustomPreview from "../CustomPreview";
import EducationPreview from "../EducationPreview";
import JobPreview from "../JobPreview";
import ProjectPreview from "../ProjectPreview";
import SkillPreview from "../SkillPreview";

const TemplateXAI: React.FC<{
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
    <div className="relative">
      <div className="text-2xl font-semibold">{meta.title}</div>
      {meta.avatar && (
        <div className="absolute right-2 top-2">
          <img
            src={meta.avatar}
            alt={meta.avatar}
            className="h-[140px] w-[100px]"
          />
        </div>
      )}
      <div className="w-full space-y-6 pt-6">
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
                      template="template_xai"
                    />
                  );
                case "education":
                  return (
                    <EducationPreview
                      key={label}
                      content={content}
                      meta={meta}
                      template="template_xai"
                    />
                  );
                case "job":
                  return (
                    <JobPreview
                      key={label}
                      content={content}
                      meta={meta}
                      template="template_xai"
                    />
                  );
                case "project":
                  return (
                    <ProjectPreview
                      key={label}
                      content={content}
                      meta={meta}
                      template="template_xai"
                    />
                  );
                case "skill":
                  return (
                    <SkillPreview
                      key={label}
                      content={content}
                      meta={meta}
                      template="template_xai"
                    />
                  );
                case "custom":
                  return (
                    <CustomPreview
                      key={label}
                      content={content}
                      meta={meta}
                      template="template_xai"
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
              template="template_xai"
            />
            <EducationPreview
              content={content}
              meta={meta}
              template="template_xai"
            />
            <SkillPreview
              content={content}
              meta={meta}
              template="template_xai"
            />
            <JobPreview
              content={content}
              meta={meta}
              template="template_xai"
            />
            <ProjectPreview
              content={content}
              meta={meta}
              template="template_xai"
            />
            <CustomPreview
              content={content}
              meta={meta}
              template="template_xai"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateXAI;
