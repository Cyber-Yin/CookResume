"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Loader2, Menu, Pencil, Trash2 } from "lucide-react";
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
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { JobFormState } from "@/lib/types/resume";
import {
  checkRichTextOutputIsNull,
  formatError,
  generateRandomSalt,
  handleEditorSortEnd,
} from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

type SortableItemProps = {
  item: {
    experience: string;
    sort: number;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    key: string;
  };
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    experience: string;
    sort: number;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    key: string;
  }) => void;
};

type SortableListProps = {
  items: SortableItemProps["item"][];
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    experience: string;
    sort: number;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    key: string;
  }) => void;
  onSortEnd: (event: DragEndEvent) => void;
};

const SortableItem = ({
  item,
  onItemDelete,
  onItemEdit,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: isDragging ? undefined : "",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full select-none space-y-3 overflow-hidden rounded-lg border border-custom-secondary bg-custom p-3"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex space-x-2 text-sm font-semibold">
          <div>{item.company}</div>
          {item.role && <div>{item.role}</div>}
          <div>{`${item.startDate} - ${item.endDate}`}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab"
          >
            <Menu className="h-3.5 w-3.5" />
          </div>
          <Pencil
            onClick={() => onItemEdit(item)}
            className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
          />
          <Trash2
            onClick={() => onItemDelete(item.key)}
            className="h-3.5 w-3.5 cursor-pointer text-danger-light"
          />
        </div>
      </div>
      {item.experience && <Viewer content={item.experience} />}
    </div>
  );
};

const SortableList = ({
  items,
  onItemDelete,
  onItemEdit,
  onSortEnd,
}: SortableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onSortEnd}
    >
      <SortableContext
        items={items.map((item) => item.key)}
        strategy={verticalListSortingStrategy}
      >
        <motion.div
          variants={OPACITY_ANIMATION}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col space-y-4 px-5 py-4"
        >
          {items.map((item) => (
            <SortableItem
              key={item.key}
              item={item}
              onItemDelete={onItemDelete}
              onItemEdit={onItemEdit}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};

const JobEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();
  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<JobFormState>({});

  useEffect(() => {
    if (!resumeInfo) return;

    const formattedJobContent = resumeInfo.content.job.reduce<JobFormState>(
      (acc, curr) => {
        acc[curr.key] = {
          experience: curr.experience || "",
          sort: curr.sort,
          company: curr.company || "",
          role: curr.role || "",
          startDate: curr.startDate || "",
          endDate: curr.endDate || "",
        };
        return acc;
      },
      {},
    );

    setFormState(formattedJobContent);
  }, [resumeInfo]);

  const sortedItems = useMemo(
    () =>
      Object.entries(formState)
        .map(([key, item]) => ({ key, ...item }))
        .sort((a, b) => a.sort - b.sort),
    [formState],
  );

  useEffect(() => {
    if (isFirstRender) return;

    setContent({
      ...content,
      job: sortedItems,
    });
  }, [sortedItems]);

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    experience: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    key: string;
  }>();

  const handleSubmit = async () => {
    await handleFormSubmit({
      content: JSON.stringify({ ...resumeInfo!.content, job: sortedItems }),
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        {sortedItems.length === 0 ? (
          <div className="flex h-[calc(100vh-7.5rem)] w-full items-center justify-center text-2xl font-semibold">
            暂无内容
          </div>
        ) : (
          <SortableList
            items={sortedItems}
            onItemDelete={(key) =>
              setFormState((prev) => {
                const { [key]: _, ...rest } = prev;
                return rest;
              })
            }
            onItemEdit={(item) =>
              setEditItem({
                key: item.key,
                experience: item.experience || "",
                company: item.company || "",
                role: item.role || "",
                startDate: item.startDate || "",
                endDate: item.endDate || "",
              })
            }
            onSortEnd={(event) =>
              handleEditorSortEnd(event, sortedItems, formState, setFormState)
            }
          />
        )}
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading}
          onClick={() => setAddItemModalOpen(true)}
          variant="outline"
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
      <AddJobModal
        open={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={(v) => {
          const key = generateRandomSalt(7);

          setFormState((prev) => ({
            ...prev,
            [key]: {
              experience: v.experience || "",
              sort:
                sortedItems.length === 0
                  ? 0
                  : sortedItems[sortedItems.length - 1].sort + 1,
              company: v.company || "",
              role: v.role || "",
              startDate: v.startDate || "",
              endDate: v.endDate || "",
            },
          }));
        }}
      />
      <ModifyJobModal
        defaultValue={editItem}
        onClose={() => setEditItem(undefined)}
        onSubmit={(v) => {
          const exist = formState[v.key];
          if (!exist) return;

          setFormState((prev) => ({
            ...prev,
            [v.key]: {
              experience: v.experience || "",
              sort: prev[v.key].sort,
              company: v.company || "",
              role: v.role || "",
              startDate: v.startDate || "",
              endDate: v.endDate || "",
            },
          }));
        }}
      />
    </div>
  );
};

const AddJobModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (v: {
    experience: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
  }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [jobExperience, setJobExperience] = useState("");
  const [jobBasicData, setJobBasicData] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    try {
      if (!jobBasicData.company) {
        throw new Error("公司不能为空");
      }

      if (!jobBasicData.startDate || !jobBasicData.endDate) {
        throw new Error("开始时间和结束时间不能为空");
      }

      onSubmit({
        experience: checkRichTextOutputIsNull(jobExperience),
        ...jobBasicData,
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
    setJobExperience("");
    setJobBasicData({
      company: "",
      role: "",
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
          <DialogTitle>添加工作经历</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
              <FormInput
                required
                value={jobBasicData.company}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    company: v,
                  }));
                }}
                label="公司名称"
              />
              <FormInput
                value={jobBasicData.role}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    role: v,
                  }));
                }}
                label="岗位"
              />
              <FormInput
                required
                value={jobBasicData.startDate}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    startDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="开始时间"
              />
              <FormInput
                required
                value={jobBasicData.endDate}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
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
                content={jobExperience}
                onChange={setJobExperience}
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

const ModifyJobModal: React.FC<{
  defaultValue?: {
    key: string;
    experience: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
  };
  onClose: () => void;
  onSubmit: (v: {
    key: string;
    experience: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
  }) => void;
}> = ({ defaultValue, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [jobExperience, setJobExperience] = useState("");
  const [jobBasicData, setJobBasicData] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    try {
      if (!jobBasicData.company) {
        throw new Error("公司名称不能为空");
      }

      if (!jobBasicData.startDate || !jobBasicData.endDate) {
        throw new Error("开始时间和结束时间不能为空");
      }

      onSubmit({
        key: defaultValue!.key,
        experience: checkRichTextOutputIsNull(jobExperience),
        ...jobBasicData,
      });
      onClose();
      clear();
    } catch (e) {
      toast({
        title: "更改失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const clear = () => {
    setJobExperience("");
    setJobBasicData({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
    });
  };

  useEffect(() => {
    if (defaultValue) {
      setJobExperience(defaultValue.experience);
      setJobBasicData({
        company: defaultValue.company,
        role: defaultValue.role,
        startDate: defaultValue.startDate,
        endDate: defaultValue.endDate,
      });
    }
  }, [defaultValue]);

  return (
    <Dialog
      open={Boolean(defaultValue)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          clear();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更改工作经历</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
              <FormInput
                required
                value={jobBasicData.company}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    company: v,
                  }));
                }}
                label="公司名称"
              />
              <FormInput
                value={jobBasicData.role}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    role: v,
                  }));
                }}
                label="岗位"
              />
              <FormInput
                required
                value={jobBasicData.startDate}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
                    ...prev,
                    startDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="开始时间"
              />
              <FormInput
                required
                value={jobBasicData.endDate}
                onValueChange={(v) => {
                  setJobBasicData((prev) => ({
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
                content={jobExperience}
                onChange={setJobExperience}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSubmit}>更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobEditor;
