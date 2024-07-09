import { useParams } from "@remix-run/react";
import axios from "axios";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import Editor from "@/components/RichText/Editor";
import Viewer from "@/components/RichText/Viewer";
import { ScrollArea } from "@/components/ScrollArea";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { EducationFormState } from "@/lib/types/resume";
import {
  checkRichTextOutputIsNull,
  cn,
  formatError,
  varifyInt,
} from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";

const EducationEditor: React.FC = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const { resumeInfo, refreshResume, resumeLoading, resumeValidating } =
    useFetchResume();

  const [formState, setFormState] = useState<EducationFormState[]>([]);

  const sortedItems = useMemo(
    () => formState.sort((a, b) => a.sort - b.sort),
    [formState],
  );

  const [submitLoading, setSubmitLoading] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!id) {
        throw new Error("简历 ID 不存在");
      }

      try {
        varifyInt.parse(parseInt(id));
      } catch (e) {
        throw new Error("ID 非法");
      }

      setSubmitLoading(true);

      await axios.post("/api/resume/update", {
        resume_id: parseInt(id),
        content: JSON.stringify({
          ...resumeInfo!.rawContent,
          education: formState,
        }),
      });

      refreshResume();

      toast({
        title: "保存成功",
        description: "简历已成功保存",
        duration: 5000,
      });
    } catch (e) {
      toast({
        title: "保存失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState(resumeInfo.formattedContent.education);
  }, [resumeInfo]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        {sortedItems.length === 0 ? (
          <div className="flex h-[calc(100vh-7.5rem)] w-full items-center justify-center text-2xl font-semibold">
            暂无内容
          </div>
        ) : (
          <div className="flex w-full flex-col space-y-4 px-5 py-4">
            {sortedItems.map((item, index) => (
              <div
                key={index}
                className="group w-full overflow-hidden rounded-lg border border-custom-secondary bg-custom p-3"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex space-x-2 text-sm font-semibold">
                    <div>{item.basicData.school}</div>
                    {item.basicData.major && <div>{item.basicData.major}</div>}
                    <div>{`${item.basicData.startDate} - ${item.basicData.endDate}`}</div>
                  </div>
                  <div className="hidden items-center space-x-2 group-hover:flex">
                    <ArrowUp
                      onClick={() => {
                        setFormState((prev) => {
                          const prevIndex = index - 1;

                          if (prevIndex < 0) return prev;

                          return prev.map((item, idx) => {
                            if (idx === index) {
                              return { ...item, sort: prev[prevIndex].sort };
                            } else if (idx === prevIndex) {
                              return { ...item, sort: prev[index].sort };
                            }

                            return item;
                          });
                        });
                      }}
                      className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
                    />
                    <ArrowDown
                      onClick={() => {
                        setFormState((prev) => {
                          const nextIndex = index + 1;

                          if (nextIndex >= prev.length) return prev;

                          return prev.map((item, idx) => {
                            if (idx === index) {
                              return { ...item, sort: prev[nextIndex].sort };
                            } else if (idx === nextIndex) {
                              return { ...item, sort: prev[index].sort };
                            }

                            return item;
                          });
                        });
                      }}
                      className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
                    />
                    <Trash2
                      onClick={() => {
                        setFormState((prev) => {
                          const newState = prev.filter(
                            (_, idx) => idx !== index,
                          );
                          return newState;
                        });
                      }}
                      className="h-3.5 w-3.5 cursor-pointer text-danger-light"
                    />
                  </div>
                </div>
                {item.experience && <Viewer content={item.experience} />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading}
          onClick={() => setAddItemModalOpen(true)}
          className="border border-custom bg-custom text-custom hover:border-primary hover:text-primary"
        >
          添加经历
        </Button>
        <Button
          disabled={submitLoading || resumeLoading || resumeValidating}
          onClick={handleSubmit}
        >
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "保存"
          )}
        </Button>
      </div>
      <AddEducationModal
        open={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={(v) => {
          setFormState((prev) => [
            ...prev,
            {
              experience: v.experience || "",
              sort: prev.length === 0 ? 0 : prev[prev.length - 1].sort + 1,
              basicData: {
                school: v.basicData.school || "",
                major: v.basicData.major || "",
                startDate: v.basicData.startDate || "",
                endDate: v.basicData.endDate || "",
              },
            },
          ]);
        }}
      />
    </div>
  );
};

const AddEducationModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (v: {
    experience: string;
    basicData: {
      school: string;
      major: string;
      startDate: string;
      endDate: string;
    };
  }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [educationExperience, setEducationExperience] = useState("");
  const [educationBasicData, setEducationBasicData] = useState({
    school: "",
    major: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    try {
      if (!educationBasicData.school) {
        throw new Error("学校不能为空");
      }

      if (!educationBasicData.startDate || !educationBasicData.endDate) {
        throw new Error("开始时间和结束时间不能为空");
      }

      onSubmit({
        experience: checkRichTextOutputIsNull(educationExperience),
        basicData: educationBasicData,
      });
      onClose();
      clear();
    } catch (e) {
      toast({
        title: "添加失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const clear = () => {
    setEducationExperience("");
    setEducationBasicData({
      school: "",
      major: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          clear();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加教育经历</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
              <FormInput
                value={educationBasicData.school}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    school: v,
                  }));
                }}
                label="学校"
              />
              <FormInput
                value={educationBasicData.major}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    major: v,
                  }));
                }}
                label="专业"
              />
              <FormInput
                value={educationBasicData.startDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    startDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="开始时间"
              />
              <FormInput
                value={educationBasicData.endDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    endDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="结束时间"
              />
            </div>
            <div className="w-full space-y-1.5">
              <Label>经历</Label>
              <Editor
                content={educationExperience}
                onChange={setEducationExperience}
                placeholder="Write your post here..."
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSubmit}>添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EducationEditor;
