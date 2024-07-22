import { useMemo } from "react";

import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

import BasicPreview from "../BasicPreview";
import CustomPreview from "../CustomPreview";
import EducationPreview from "../EducationPreview";
import JobPreview from "../JobPreview";
import ProjectPreview from "../ProjectPreview";
import SkillPreview from "../SkillPreview";

const TemplateKBS: React.FC<{
  content?: ResumeContent;
  meta?: ResumeMeta;
}> = ({ content, meta }) => {
  const BasicJobString = useMemo(() => {
    if (!content || content.basic.length === 0) return "";

    const match = content.basic.find((item) => item.key === "job");

    return match ? match.value : "";
  }, [content]);

  const BasicNameString = useMemo(() => {
    if (!content || content.basic.length === 0) return "";

    const match = content.basic.find((item) => item.key === "name");

    return match ? match.value : "";
  }, [content]);

  if (!content || !meta) {
    return <></>;
  }

  if (content.basic.length === 0) {
    return <></>;
  }

  return (
    <div className="w-full space-y-6">
      {!BasicNameString && !BasicJobString ? (
        <></>
      ) : (
        <div className="flex h-12 w-full items-center justify-between rounded-lg bg-slate-500 px-8 text-white">
          {BasicNameString && (
            <div className="text-2xl font-semibold">{BasicNameString}</div>
          )}
          {BasicJobString && (
            <div className="text-lg font-semibold">{`求职意向：${BasicJobString}`}</div>
          )}
        </div>
      )}

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
                    template="template_kbs"
                  />
                );
              case "education":
                return (
                  <EducationPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_kbs"
                  />
                );
              case "job":
                return (
                  <JobPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_kbs"
                  />
                );
              case "project":
                return (
                  <ProjectPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_kbs"
                  />
                );
              case "skill":
                return (
                  <SkillPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_kbs"
                  />
                );
              case "custom":
                return (
                  <CustomPreview
                    key={label}
                    content={content}
                    meta={meta}
                    template="template_kbs"
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
            template="template_kbs"
          />
          <EducationPreview
            content={content}
            meta={meta}
            template="template_kbs"
          />
          <SkillPreview
            content={content}
            meta={meta}
            template="template_kbs"
          />
          <JobPreview
            content={content}
            meta={meta}
            template="template_kbs"
          />
          <ProjectPreview
            content={content}
            meta={meta}
            template="template_kbs"
          />
          <CustomPreview
            content={content}
            meta={meta}
            template="template_kbs"
          />
        </>
      )}
    </div>
  );
};

export default TemplateKBS;
