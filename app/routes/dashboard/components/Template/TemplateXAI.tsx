import Viewer from "@/components/RichText/Viewer";
import { ResumeContent, ResumeMeta } from "@/lib/types/resume";

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
                    <div
                      key={label}
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
                case "education":
                  return content.education.length > 0 ? (
                    <div
                      key={label}
                      className="w-full space-y-3"
                    >
                      <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                        <div
                          style={{
                            clipPath:
                              "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                          }}
                          className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                        >
                          教育背景
                        </div>
                      </div>
                      {content.education.map((item) => {
                        return (
                          <div
                            key={item.key}
                            className="w-full space-y-2"
                          >
                            <div className="flex w-full items-center justify-between font-semibold">
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
                      <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                        <div
                          style={{
                            clipPath:
                              "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                          }}
                          className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                        >
                          工作经历
                        </div>
                      </div>
                      {content.job.map((item) => {
                        return (
                          <div
                            key={item.key}
                            className="w-full space-y-2"
                          >
                            <div className="flex w-full items-center justify-between font-semibold">
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
                      <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                        <div
                          style={{
                            clipPath:
                              "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                          }}
                          className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                        >
                          项目经验
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
                      <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                        <div
                          style={{
                            clipPath:
                              "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                          }}
                          className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                        >
                          个人技能
                        </div>
                      </div>
                      <div className="w-full space-y-2">
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
                      <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                        <div
                          style={{
                            clipPath:
                              "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                          }}
                          className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                        >
                          {content.custom.label}
                        </div>
                      </div>
                      <div className="w-full space-y-2">
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
            <div className="w-full space-y-3">
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
            {content.education.length > 0 && (
              <div className="w-full space-y-3">
                <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                  <div
                    style={{
                      clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                    }}
                    className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                  >
                    教育背景
                  </div>
                </div>
                {content.education.map((item) => {
                  return (
                    <div
                      key={item.key}
                      className="w-full space-y-2"
                    >
                      <div className="flex w-full items-center justify-between font-semibold">
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
                <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                  <div
                    style={{
                      clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                    }}
                    className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                  >
                    个人技能
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Viewer content={content.skill} />
                </div>
              </div>
            )}
            {content.job.length > 0 && (
              <div className="w-full space-y-3">
                <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                  <div
                    style={{
                      clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                    }}
                    className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                  >
                    工作经历
                  </div>
                </div>
                {content.job.map((item) => {
                  return (
                    <div
                      key={item.key}
                      className="w-full space-y-2"
                    >
                      <div className="flex w-full items-center justify-between font-semibold">
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
                <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                  <div
                    style={{
                      clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                    }}
                    className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                  >
                    项目经验
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
                      {item.description && (
                        <Viewer content={item.description} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {content.custom.label && content.custom.value && (
              <div className="w-full space-y-3">
                <div className="flex w-full items-center space-x-2 border-b border-[#333333]">
                  <div
                    style={{
                      clipPath: "polygon(0% 100%, 0% 0%, 85% 0%, 100% 100%)",
                    }}
                    className="shrink-0 bg-[#333333] py-1 pl-3 pr-6 text-lg font-semibold text-white"
                  >
                    {content.custom.label}
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <Viewer content={content.custom.value} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateXAI;
