import { useMemo } from "react";

import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

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
                  <div
                    key={label}
                    className="w-full px-3"
                  >
                    <div className="flex w-full items-start space-x-6 px-3">
                      {content.basic.filter(
                        (item) => item.key !== "name" && item.key !== "job",
                      ).length > 0 && (
                        <div className="grid grow grid-cols-2 gap-x-3 gap-y-2">
                          {content.basic
                            .filter(
                              (item) =>
                                item.key !== "name" && item.key !== "job",
                            )
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
              case "education":
                return content.education.length > 0 ? (
                  <div
                    key={label}
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
                        教育背景
                      </div>
                      <div className="h-[1px] w-full grow bg-black"></div>
                    </div>
                    {content.education.map((item) => {
                      return (
                        <div
                          key={item.key}
                          className="w-full space-y-2 px-3"
                        >
                          <div className="flex w-full items-center justify-between font-semibold text-slate-500">
                            <div>{`${item.startDate} - ${item.endDate}`}</div>
                            <div>{item.school}</div>
                            <div>{item.major}</div>
                          </div>
                          {item.experience && (
                            <Viewer content={item.experience} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              case "job":
                return content.job.length > 0 ? (
                  <div
                    key={label}
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
                        工作经历
                      </div>
                      <div className="h-[1px] w-full grow bg-black"></div>
                    </div>
                    {content.job.map((item) => {
                      return (
                        <div
                          key={item.key}
                          className="w-full space-y-2 px-3"
                        >
                          <div className="flex w-full items-center justify-between font-semibold text-slate-500">
                            <div>{`${item.startDate} - ${item.endDate}`}</div>
                            <div>{item.company}</div>
                            <div>{item.role}</div>
                          </div>
                          {item.experience && (
                            <Viewer content={item.experience} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              case "project":
                return content.project.length > 0 ? (
                  <div
                    key={label}
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
                        项目经验
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
                          {item.description && (
                            <Viewer content={item.description} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              case "skill":
                return content.skill ? (
                  <div
                    key={label}
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
                        个人技能
                      </div>
                      <div className="h-[1px] w-full grow bg-black"></div>
                    </div>
                    <div className="w-full space-y-2 px-3">
                      <Viewer content={content.skill} />
                    </div>
                  </div>
                ) : null;
              case "custom":
                return content.custom.label && content.custom.value ? (
                  <div
                    key={label}
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
                        {content.custom.label}
                      </div>
                      <div className="h-[1px] w-full grow bg-black"></div>
                    </div>
                    <div className="w-full space-y-2 px-3">
                      <Viewer content={content.custom.value} />
                    </div>
                  </div>
                ) : null;
              default:
                return null;
            }
          })}
        </>
      ) : (
        <>
          <div className="w-full px-3">
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
          {content.education.length > 0 && (
            <div className="w-full space-y-3">
              <div className="flex w-full items-center space-x-2">
                <div
                  style={{
                    clipPath:
                      "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
                  }}
                  className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
                >
                  教育背景
                </div>
                <div className="h-[1px] w-full grow bg-black"></div>
              </div>
              {content.education.map((item) => {
                return (
                  <div
                    key={item.key}
                    className="w-full space-y-2 px-3"
                  >
                    <div className="flex w-full items-center justify-between font-semibold text-slate-500">
                      <div>{`${item.startDate} - ${item.endDate}`}</div>
                      <div>{item.school}</div>
                      <div>{item.major}</div>
                    </div>
                    {item.experience && <Viewer content={item.experience} />}
                  </div>
                );
              })}
            </div>
          )}
          {content.skill && (
            <div className="w-full space-y-3">
              <div className="flex w-full items-center space-x-2">
                <div
                  style={{
                    clipPath:
                      "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
                  }}
                  className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
                >
                  个人技能
                </div>
                <div className="h-[1px] w-full grow bg-black"></div>
              </div>
              <div className="w-full space-y-2 px-3">
                <Viewer content={content.skill} />
              </div>
            </div>
          )}
          {content.job.length > 0 && (
            <div className="w-full space-y-3">
              <div className="flex w-full items-center space-x-2">
                <div
                  style={{
                    clipPath:
                      "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
                  }}
                  className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
                >
                  工作经历
                </div>
                <div className="h-[1px] w-full grow bg-black"></div>
              </div>
              {content.job.map((item) => {
                return (
                  <div
                    key={item.key}
                    className="w-full space-y-2 px-3"
                  >
                    <div className="flex w-full items-center justify-between font-semibold text-slate-500">
                      <div>{`${item.startDate} - ${item.endDate}`}</div>
                      <div>{item.company}</div>
                      <div>{item.role}</div>
                    </div>
                    {item.experience && <Viewer content={item.experience} />}
                  </div>
                );
              })}
            </div>
          )}
          {content.project.length > 0 && (
            <div className="w-full space-y-3">
              <div className="flex w-full items-center space-x-2">
                <div
                  style={{
                    clipPath:
                      "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
                  }}
                  className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
                >
                  项目经验
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
          )}

          {content.custom.label && content.custom.value && (
            <div className="w-full space-y-3">
              <div className="flex w-full items-center space-x-2">
                <div
                  style={{
                    clipPath:
                      "polygon(0% 50%, 10% 100%, 90% 100%, 100% 50%, 90% 0%, 10% 0%)",
                  }}
                  className="shrink-0 rounded-lg bg-slate-500 px-6 py-1 text-lg font-semibold text-white"
                >
                  {content.custom.label}
                </div>
                <div className="h-[1px] w-full grow bg-black"></div>
              </div>
              <div className="w-full space-y-2 px-3">
                <Viewer content={content.custom.value} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateKBS;
