import { useMemo } from "react";

import { ResumeBasicData, ResumeContent, ResumeMeta } from "@/lib/types/resume";

const LableName = "基本信息";

const BasicPreview: React.FC<{
  content: ResumeContent;
  meta: ResumeMeta;
  template: string;
}> = ({ content, meta, template }) => {
  if (content.basic.length === 0) {
    return null;
  }

  const chunks = useMemo(
    () =>
      content.basic.reduce<ResumeBasicData[][]>((acc, item, index) => {
        const chunkIndex = Math.floor(index / 4);

        if (!acc[chunkIndex]) {
          acc[chunkIndex] = [];
        }

        acc[chunkIndex].push(item);

        return acc;
      }, []),
    [content.basic],
  );

  switch (template) {
    case "template_kbs":
      return (
        <div
          key={template}
          className="w-full px-3"
        >
          <div className="flex w-full items-start space-x-6 px-3">
            {content.basic.filter(
              (item) => item.key !== "name" && item.key !== "job",
            ).length > 0 && (
              <div className="grid grow grid-cols-2 gap-x-3 gap-y-2">
                {content.basic
                  .filter((item) => item.key !== "name" && item.key !== "job")
                  .map((item) => {
                    return item.value ? (
                      <div
                        className="flex items-center space-x-3"
                        key={item.key}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0f172a]"></div>
                        <div className="flex items-center">
                          <div>{`${item.label}：`}</div>
                          <div>{item.value}</div>
                        </div>
                      </div>
                    ) : null;
                  })}
              </div>
            )}
            {meta.avatar && (
              <div className="shrink-0">
                <img
                  src={meta.avatar}
                  alt={meta.avatar}
                  className="h-[140px] w-[100px]"
                />
              </div>
            )}
          </div>
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
          <div className="flex w-full items-start px-3">
            <div className="grid grow grid-cols-2 gap-x-3 gap-y-2">
              {content.basic.map((item) => {
                return item.value ? (
                  <div
                    className="flex items-center space-x-3"
                    key={item.key}
                  >
                    <div className="flex items-center">
                      <div>{`${item.label}：`}</div>
                      <div>{item.value}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
            {meta.avatar && (
              <div className="shrink-0">
                <img
                  src={meta.avatar}
                  alt={meta.avatar}
                  className="h-[140px] w-[100px]"
                />
              </div>
            )}
          </div>
        </div>
      );
    case "template_xai":
      return (
        <div
          key={template}
          className="w-full space-y-3"
        >
          <div className="flex w-3/4">
            <div className="grid grow grid-cols-2 gap-x-3 gap-y-2">
              {content.basic.map((item) => {
                return item.value ? (
                  <div
                    className="flex items-center space-x-3"
                    key={item.key}
                  >
                    <div className="flex items-center">
                      <div>{`${item.label}：`}</div>
                      <div>{item.value}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      );
    case "template_dcv":
      return (
        <div
          key={template}
          className="w-3/4 space-y-3"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            {chunks.map((chunk, index) => {
              return (
                <div
                  className="flex items-center divide-x divide-[#ccc]"
                  key={index}
                >
                  {chunk.map((item) => {
                    return item.value ? (
                      <div
                        className="px-2"
                        key={item.key}
                      >
                        {item.value}
                      </div>
                    ) : null;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default BasicPreview;
